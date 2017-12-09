import { SyncedCron } from 'meteor/percolate:synced-cron';
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
  start () {
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
      added (server) {
        debug && console.log('IntegrationService.serverObserver.added:', server._id, server.title);
        service.createServiceProvider(server);
      },
      changed (newDoc, oldDoc) {
        debug && console.log('IntegrationService.serverObserver.changed:', newDoc._id, newDoc.title);
        service.updateServiceProvider(newDoc, oldDoc);
      },
      removed (server) {
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
  createServiceProvider (server) {
    console.log('IntegrationService.createServiceProvider:', server._id, server.title);
    let service = this;
    
    // Create the service if the server is active
    if (server.isActive) {
      let provider = service.getServiceProvider(server);
      if (provider == null) {
        // Create the service provider record
        service.setServiceProvider(server, new IntegrationServiceProvider(server));
        
        // Update the health of the provider
        service.getServiceProvider(server).checkHealth();
      } else {
        console.error('IntegrationService.createServiceProvider provider already exists:', server._id, server.title);
      }
    } else {
      console.log('IntegrationService.createServiceProvider ignored because server is not active:', server._id, server.title);
    }
  },
  
  /**
   * Set the IntegrationServiceProvider for a given server
   * @param server
   * @param provider
   */
  setServiceProvider (server, provider) {
    debug && console.log('IntegrationService.setServiceProvider:', server._id, server.title);
    
    this.providers[ server._id ] = provider;
  },
  
  /**
   * Retrieve the IntegrationServiceProvider for a given server
   * @param server
   */
  getServiceProvider (server) {
    debug && console.log('IntegrationService.getServiceProvider:', server._id, server.title);
    
    return this.providers && this.providers[ server._id ];
  },
  
  /**
   * Handle a change to a service provider
   * Really only care about active/inactive, other changes are handled by the provider itself
   * @param {*} newDoc
   * @param {*} oldDoc
   */
  updateServiceProvider (newDoc, oldDoc) {
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
  destroyServiceProvider (server) {
    console.log('IntegrationService.destroyServiceProvider:', server._id, server.title);
    let service  = this,
        provider = service.getServiceProvider(server);
    
    if (provider) {
      provider.destroy();
      delete service.providers[ server._id ];
    }
  },
  
  /**
   * Attempt to authenticate a service provider
   * @param server
   * @param username
   * @param password
   */
  authenticateServiceProvider (server, username, password) {
    console.log('IntegrationService.authenticateServiceProvider:', server._id, server.title, username);
    let service = this,
        provider = service.getServiceProvider(server);
    
    if(provider){
      return provider.authenticate(username, password);
    } else {
      throw new Meteor.Error(404, "Service Provider not found");
    }
  },
  
  /**
   * Attempt to log out of a service provider
   * @param server
   */
  unAuthenticateServiceProvider (server) {
    console.log('IntegrationService.authenticateServiceProvider:', server._id, server.title);
    let service = this,
        provider = service.getServiceProvider(server);
    
    if(provider){
      return provider.unAuthenticate();
    } else {
      throw new Meteor.Error(404, "Service Provider not found");
    }
  },
  
  /**
   * Stop all integrations
   */
  stop () {
    console.log('IntegrationService.stop');
    let service = this;
    
    // Update the IntegrationService health tracker
    service.serverObserver.stop();
  }
};