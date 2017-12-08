import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Util } from '../../api/util';
import { IntegrationServers } from '../../api/integrations/integration_servers';
import { HealthTracker } from '../../api/system_health_metrics/server/health_tracker';
import { IntegrationServiceProvider } from './integration_service_provider';

/**
 * Singleton responsible for tracking and managing the integrations
 */
export const IntegrationService = {
  /**
   * Start the service to monitor integrations
   */
  start () {
    console.log(Util.timestamp(), 'IntegrationService.start');
    let service = this;
    
    // Initialize the IntegrationService health tracker
    HealthTracker.init('integration-service', 'Integration Service');
    
    // Create a place to store the servers and service providers
    service.servers   = {};
    service.providers = {};
    
    // Start Synced Cron
    SyncedCron.start();
    
    // Monitor the IntegrationServers collection to respond to additions, deletions, and modifications
    IntegrationService.serverObserver = IntegrationServers.find({}).observe({
      added (server) {
        console.log('IntegrationService.serverObserver.added:', server._id, server.title);
        
        // Create the service provider object
        service.servers[ server._id ] = new IntegrationServiceProvider();
      },
      removed (server) {
        console.log('IntegrationService.serverObserver.removed:', server._id, server.title);
      }
    });
    
    // Update the IntegrationService health tracker
    HealthTracker.update('integration-service', true);
  },
  
  /**
   * Stop all integrations
   */
  stop () {
    console.log(Util.timestamp(), 'IntegrationService.stop');
    
    // Update the IntegrationService health tracker
  }
};