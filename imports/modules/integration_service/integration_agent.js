//import { moment } from 'meteor/momentjs:moment';
import { SyncedCron }    from 'meteor/percolate:synced-cron';
import { Integrations }  from '../../api/integrations/integrations';
import { ImportedItems } from '../../api/imported_items/imported_items';
import { HealthTracker } from '../../api/system_health_metrics/server/health_tracker';

let debug = true,
    trace = false;

export class IntegrationAgent {
  /**
   * IntegrationServiceProvider provides connectivity to IntegrationAgents
   * @param integration {Integration}
   * @param serviceProvider {IntegrationServiceProvider}
   */
  constructor (integration, serviceProvider) {
    console.log('Creating new IntegrationAgent:', integration._id);
    let self = this;
    
    self.integration     = Integrations.findOne({ _id: integration._id });
    self.serviceProvider = serviceProvider;
    
    if (!self.serviceProvider) {
      console.error('IntegrationAgent could not find service provider:', integration.server());
    }
    
    // Initialize the health tracker
    self.trackerKey = 'integration-agent-' + integration._id;
    HealthTracker.add(self.trackerKey, self.integration.project().title + ' - ' + self.integration.itemTypeTitle(), 'integrationAgent');
    
    // Observe the Integrations collection for document updates
    // Needs to be deferred because you can't create observers in a call stack from another observer
    Meteor.defer(() => {
      self.observer = Integrations.find({ _id: self.integration._id }).observe({
        changed (newDoc, oldDoc) {
          debug && console.log('IntegrationAgent.observer.changed:', newDoc._id, newDoc.title);
          
          // Update the local cache of the document
          self.integration = Integrations.findOne({ _id: self.integration._id });
        }
      });
    });
    
    // Schedule the job to run the query periodically
    self.queryJobKeys = [];
    self.updateQueryJobs();
  }
  
  /**
   * Create or update the cron job for updating the data for this integration
   */
  updateQueryJobs () {
    debug && console.log('IntegrationAgent.updateQueryJobs:', this.integration._id);
    let self             = this,
        queryDefinitions = self.serviceProvider.getQueryDefinitions();
    
    // Get the query definitions
    if (queryDefinitions) {
      _.keys(queryDefinitions).forEach((queryKey) => {
        let queryJobKey = self.trackerKey + '-query-' + queryKey;
        self.queryJobKeys.push(queryKey);
        SyncedCron.remove(queryJobKey);
        
        SyncedCron.add({
          name: queryJobKey,
          schedule (parser) {
            let parserText = self.integration.updateFrequency || 'every 10 minutes';
            debug && console.log('IntegrationAgent.updateQueryJobs setting schedule:', queryJobKey, '"', parserText, '"');
            return parser.text(parserText);
          },
          job () {
            self.executeQuery(queryKey);
          }
        });
      });
    }
  }
  
  /**
   * Execute the query
   */
  executeQuery (queryKey) {
    debug && console.log('IntegrationAgent.executeQuery:', this.integration._id, queryKey);
    let self  = this,
        query = self.integration.details[ queryKey ];
    
    if (self.serviceProvider.isHealthy()) {
      try {
        // Determine when the last import was to pull in the updates
        let startTime        = Date.now(),
            mostRecentImport = ImportedItems.findOne({ integrationId: self.integration._id }, { lastImported: -1 }),
            lastUpdate;
        
        if (mostRecentImport && mostRecentImport.lastImported) {
          lastUpdate = mostRecentImport.lastImported;
        } else {
          lastUpdate = moment().subtract(6, 'months').hours(0).minutes(0).seconds(0);
        }
        
        // Append the update limit to the query
        query = self.serviceProvider.integrator.appendUpdateLimitToQuery(query, lastUpdate);
        
        // Fetch the data from the service provider
        let importResult = self.serviceProvider.importItemsFromQuery(self.integration.importFunction(), query);
        
        if (importResult.items && importResult.items.length) {
          debug && console.log('IntegrationAgent.executeQuery returned:', self.integration._id, queryKey, importResult.items.length);
          
          // Persist all of the results
          importResult.items.forEach((item) => {
            self.serviceProvider.storeImportedItem(self.integration._id, self.integration.projectId, self.integration.itemType, item);
          });
          
          HealthTracker.update(self.trackerKey, true, {
            message: importResult.items.length + ' items imported in ' + moment.duration(Date.now() - startTime).seconds() + ' s'
          });
        } else if (importResult.failures && importResult.failures.length) {
          console.error('IntegrationAgent.executeQuery item processing failed:', importResult.failures.length);
          HealthTracker.update(self.trackerKey, false, { message: 'Import failed for all items' });
        } else {
          // Healthy
          HealthTracker.update(self.trackerKey, true, { message: 'No updates since ' + moment(lastUpdate).format('MM/DD hh:mm a') });
        }
      } catch (e) {
        console.error('IntegrationAgent.executeQuery failed:', queryKey, self.integration, e);
        HealthTracker.update(self.trackerKey, false, { message: 'Query execution failed' });
      }
    } else {
      HealthTracker.update(self.trackerKey, false, { message: 'Service provider is not healthy' });
    }
  }
  
  /**
   * Execute all of the queries on-demand
   */
  executeAllQueries () {
    debug && console.log('IntegrationAgent.executeAllQueries:', this.integration._id);
    let self             = this,
        queryDefinitions = self.serviceProvider.getQueryDefinitions();
    
    if (queryDefinitions) {
      _.keys(queryDefinitions).forEach((queryKey) => {
        self.executeQuery(queryKey);
      });
    }
  }
  
  /**
   * Reprocess the items that have been imported for an integration via this provider
   */
  reprocessItems () {
    debug && console.log('IntegrationAgent.reprocessItems:', this.integration._id);
    let self           = this,
        importFunction = self.integration.importFunction();
    
    /*
    let testIem         = ImportedItems.findOne({ integrationId: self.integration._id }),
        reprocessedItem = self.serviceProvider.postProcessItem(testIem.document);
    
    return {
      reprocessedItem: reprocessedItem,
      reimportResult : self.serviceProvider.importItem(importFunction, reprocessedItem, self.integration.projectId)
    };
    */
    
    // Load all of the items and reprocess them
    ImportedItems.find({ integrationId: self.integration._id }).forEach((item, i) => {
      i % 50 === 0 && console.log('IntegrationAgent.reprocessItems reprocessing item', i);
      
      let reprocessedItem = self.serviceProvider.postProcessItem(item.document),
          reimportResult  = self.serviceProvider.importItem(importFunction, reprocessedItem, self.integration.projectId);
      
      if (reimportResult.success) {
        try {
          self.serviceProvider.storeImportedItem(self.integration._id, self.integration.projectId, self.integration.itemType, reimportResult.item);
        } catch (e) {
          console.error('IntegrationAgent.reprocessItems storeImportedItem failed:', e);
          throw new Meteor.Error(e.toString())
        }
      } else {
        console.error('IntegrationAgent.reprocessItems importItem failed:', item.identifier, reimportResult.error);
      }
    });
    
    debug && console.log('IntegrationAgent.reprocessItems complete:', self.integration._id);
  }
  
  /**
   * Shut this agent down in prep for being deleted
   */
  destroy () {
    console.log('IntegrationAgent.destroy:', this.integration._id);
    let self = this;
    
    // Shut down the change observer
    self.observer.stop();
    
    // Remove the HealthTracker data
    HealthTracker.remove(self.trackerKey);
    
    // Remove the cron job to check status & cache
    SyncedCron.remove(self.trackerKey);
    self.queryJobKeys.forEach((jobKey) => {
      SyncedCron.remove(jobKey);
    });
  }
}