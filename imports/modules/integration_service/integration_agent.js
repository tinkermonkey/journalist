import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Integrations } from '../../api/integrations/integrations';
import { IntegrationService } from './integration_service';
import { HealthTracker } from '../../api/system_health_metrics/server/health_tracker';

let debug = true,
    trace = false;

export class IntegrationAgent {
  /**
   * IntegrationServiceProvider provides connectivity to IntegrationAgents
   * @param integration {Integration}
   */
  constructor (integration) {
    console.log('Creating new IntegrationAgent:', integration._id);
    let self = this;
    
    self.integration     = integration;
    self.serviceProvider = IntegrationService.getServiceProvider(integration.server());
    
    if (!self.serviceProvider) {
      console.error('IntegrationAgent could not find service provider:', IntegrationService.providers, integration.server());
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
          self.integration = newDoc;
          
          // If the server has changed, get the new service provider
          if (newDoc.serverId !== oldDoc.serverId) {
            self.serviceProvider = IntegrationService.getServiceProvider({ _id: newDoc.serverId, title: 'Updated server' });
          }
        }
      });
    });
    
    // Schedule the health check job
    self.updateHealthCheckJob();
    
    // Schedule the job to run the query periodically
    self.queryJobKeys = [];
    self.updateQueryJobs();
  }
  
  /**
   * Create or update the cron job for updating the data for this integration
   */
  updateQueryJobs () {
    debug && console.log('IntegrationAgent.updateQueryJobs:', this.integration._id);
    let self = this;
    
    // Get the query definitions
    if (self.serviceProvider && self.serviceProvider.integrator) {
      self.queryDefs = self.serviceProvider.integrator.queryDefinitions();
      
      _.keys(self.queryDefs).forEach((queryKey) => {
        let queryJobKey = self.trackerKey + '-query-' + queryKey;
        self.queryJobKeys.push(queryKey);
        SyncedCron.remove(queryJobKey);
        
        SyncedCron.add({
          name: queryJobKey,
          schedule (parser) {
            let parserText = 'every 60 seconds';
            debug && console.log('IntegrationAgent.updateQueryJobs setting schedule:', queryJobKey, "'", parserText, "'");
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
   * Create or update the cron job for updating the server health
   */
  updateHealthCheckJob () {
    debug && console.log('IntegrationAgent.updateHealthCheckJob:', this.integration._id);
    let self = this;
    
    SyncedCron.remove(self.trackerKey);
    
    SyncedCron.add({
      name: self.trackerKey,
      schedule (parser) {
        let parserText = 'every 5 minutes';
        debug && console.log('IntegrationAgent.updateHealthCheckJob setting schedule:', self.integration._id, "'", parserText, "'");
        return parser.text(parserText);
      },
      job () {
        self.checkHealth();
      }
    });
  }
  
  /**
   * Check the health of this integration
   */
  checkHealth () {
    debug && console.log('IntegrationAgent.checkHealth:', this.integration._id);
    let self    = this,
        healthy = true,
        details;
    
    if (self.serviceProvider && self.serviceProvider.integrator) {
    
    } else {
      healthy = false;
      details = { error: 'Service provider not available' }
    }
    
    HealthTracker.update(self.trackerKey, healthy, details);
  }
  
  /**
   * Execute the query
   */
  executeQuery (queryKey) {
    debug && console.log('IntegrationAgent.executeQuery:', this.integration._id, queryKey);
    let self = this;
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