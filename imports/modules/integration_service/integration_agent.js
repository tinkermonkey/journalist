import { SyncedCron } from 'meteor/percolate:synced-cron';

let debug = true,
    trace = false;

export class IntegrationAgent {
  /**
   * IntegrationServiceProvider provides connectivity to IntegrationAgents
   * @param integration {Integration}
   * @param serviceProvider {IntegrationServiceProvider}
   */
  constructor (integration, serviceProvider) {
    console.log('Creating new IntegrationAgent:', integration._id, serviceProvider.server.title);
    let self = this;
    
    self.integration     = integration;
    self.serviceProvider = serviceProvider;
    
    // Observe the Integrations collection for document updates
    // Needs to be deferred because you can't create observers in a call stack from another observer
    Meteor.defer(() => {
      self.observer = Integrations.find({ _id: self.integration._id }).observe({
        changed (newDoc, oldDoc) {
          debug && console.log('IntegrationAgent.observer.changed:', newDoc._id, newDoc.title);
          
          // Update the local cache of the document
          self.integration = newDoc;
        }
      });
    });
    
  }
  
  /**
   * Create or update the cron job for updating the data for this integration
   */
  updateQueryJobs () {
    debug && console.log('IntegrationAgent.updateQueryJobs:', this.server._id, this.server.title);
    let self = this;
    
    SyncedCron.remove(self.trackerKey + '-cache');
    
    SyncedCron.add({
      name: self.trackerKey + '-cache',
      schedule (parser) {
        let parserText = self.server.cacheUpdateFrequency || 'every 30 minutes';
        debug && console.log('IntegrationAgent.updateCacheServiceJob setting schedule:', self.server._id, self.server.title, "'", parserText, "'");
        return parser.text(parserText);
      },
      job () {
        self.updateCachedData();
      }
    });
  }
  
  /**
   * Create or update the cron job for updating the server health
   */
  updateHealthCheckJob () {
    debug && console.log('IntegrationAgent.updateHealthCheckJob:', this.server._id, this.server.title);
    let self = this;
    
    SyncedCron.remove(self.trackerKey);
    
    SyncedCron.add({
      name: self.trackerKey,
      schedule (parser) {
        let parserText = self.server.healthCheckFrequency || 'every 5 minutes';
        debug && console.log('IntegrationAgent.updateHealthCheckJob setting schedule:', self.server._id, self.server.title, "'", parserText, "'");
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
    debug && console.log('IntegrationAgent.updateHealthCheckJob:', this.server._id, this.server.title);
    let self = this;
  }
  
}