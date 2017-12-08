import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Util } from '../../api/util';
import { IntegrationServers } from '../../api/integrations/integration_servers';
import { HealthTracker } from '../../api/system_health_metrics/server/health_tracker';
import { IntegrationServiceProvider } from './integration_service_provider';

let debug = true;

/**
 * Singleton responsible for tracking and managing the integrations
 */
export const IntegrationService = {
  /**
   * Start the service to monitor integrations
   */
  start() {
    console.log('IntegrationService.start');
    let service = this;

    // Initialize the IntegrationService health tracker
    HealthTracker.add('integration-service', 'Integration Service');

    // Create a place to store the service providers
    service.providers = {};

    // Start Synced Cron
    SyncedCron.start();

    // Monitor the IntegrationServers collection to respond to additions, deletions, and modifications
    service.serverObserver = IntegrationServers.find({}).observe({
      added(server) {
        debug && console.log('IntegrationService.serverObserver.added:', server._id, server.title);
        service.createServiceProvider(server);
      },
      changed(newDoc, oldDoc) {
        debug && console.log('IntegrationService.serverObserver.changed:', newDoc._id, newDoc.title);
        service.updateServiceProvider(newDoc, oldDoc);
      },
      removed(server) {
        console.log('IntegrationService.serverObserver.removed:', server._id, server.title);
        service.destroyServiceProvider(server);
      }
    });

    // Update the IntegrationService health tracker
    HealthTracker.update('integration-service', true);
  },

  /**
   * Create a new service provider
   * @param {*} server 
   */
  createServiceProvider(server) {
    console.log('IntegrationService.createServiceProvider:', server._id, server.title);
    let service = this;

    // Create the service if the server is active
    if (server.isActive) {
      if (service.providers[server._id]) {
        console.error('IntegrationService.createServiceProvider provider already exists:', server._id, server.title);
      } else {
        // Create the service provider record
        service.providers[server._id] = new IntegrationServiceProvider(server);

        // Update the health of the provider
        service.providers[server._id].checkHealth();
      }
    } else {
      console.log('IntegrationService.createServiceProvider ignored because server is not active:', server._id, server.title);
    }
  },

  /**
   * Handle a change to a service provider
   * Really only care about active/inactive, other changes are handled by the provider itself
   * @param {*} newDoc 
   * @param {*} oldDoc 
   */
  updateServiceProvider(newDoc, oldDoc) {
    console.log('IntegrationService.updateServiceProvider:', newDoc._id, newDoc.title, newDoc.isActive);
    let service = this;

    // Respond to server active flag changes
    if (newDoc.isActive !== oldDoc.isActive) {
      if (newDoc.isActive) {
        service.createServiceProvider(newDoc);
      } else {
        service.destroyServiceProvider(newDoc);
      }
    }
  },

  /**
   * Destroy a service provider
   * @param {*} server 
   */
  destroyServiceProvider(server) {
    console.log('IntegrationService.destroyServiceProvider:', server._id, server.title);
    let service = this;

    if (service.providers[server._id]) {
      service.providers[server._id].destroy();
      delete service.providers[server._id];
    }
  },

  /**
   * Stop all integrations
   */
  stop() {
    console.log('IntegrationService.stop');
    let service = this;

    // Update the IntegrationService health tracker
    service.serverObserver.stop();
  }
};