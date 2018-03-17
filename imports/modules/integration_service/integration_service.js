import { logger }                     from 'meteor/austinsand:journalist-logger';
import { SyncedCron }                 from 'meteor/percolate:synced-cron';
import { Clustering }                 from 'meteor/austinsand:journalist-clustering';
import { IntegrationServiceProvider } from './integration_service_provider';
import { IntegrationServers }         from '../../api/integrations/integration_servers';
import { HealthTracker }              from '../../api/system_health_metrics/server/health_tracker';

let debug = false;

/**
 * Singleton responsible for tracking and managing the integrations
 */
export const IntegrationService = {
  /**
   * Start the service to monitor integrations
   */
  start () {
    logger.info('IntegrationService.start');
    let self = this;
    
    // Initialize the IntegrationService health tracker
    HealthTracker.add('integration-service', 'Integration Service');
    
    // Create a place to store the service providers
    self.providers = {};
    
    // Monitor the IntegrationServers collection to respond to additions, deletions, and modifications
    self.serverObserver = IntegrationServers.find({}).observe({
      added (server) {
        debug && logger.info('IntegrationService.serverObserver.added:', server._id, server.title);
        Meteor.defer(() => {
          self.createServiceProvider(server);
        });
      },
      changed (newDoc, oldDoc) {
        debug && logger.info('IntegrationService.serverObserver.changed:', newDoc._id, newDoc.title);
        Meteor.defer(() => {
          self.updateServiceProvider(newDoc, oldDoc);
        });
      },
      removed (server) {
        logger.info('IntegrationService.serverObserver.removed:', server._id, server.title);
        Meteor.defer(() => {
          self.destroyServiceProvider(server);
        });
      }
    });
    
    // Update the IntegrationService health tracker
    HealthTracker.update('integration-service', true);
  },
  
  /**
   * Provide a set of query definitions
   */
  queryDefinitions (integrationType) {
    return IntegrationServiceProvider.queryDefinitions(integrationType);
  },
  
  /**
   * Create a new service provider
   * @param {*} server
   */
  createServiceProvider (server) {
    logger.info('IntegrationService.createServiceProvider:', server._id, server.title);
    let self = this;
    
    // Create the service if the server is active
    if (server.isActive) {
      let provider = self.getServiceProvider(server);
      if (provider == null) {
        // Create the service provider record
        self.setServiceProvider(server, new IntegrationServiceProvider(server));
      } else {
        logger.error('IntegrationService.createServiceProvider provider already exists:', server._id, server.title);
      }
    } else {
      logger.info('IntegrationService.createServiceProvider ignored because server is not active:', server._id, server.title);
    }
  },
  
  /**
   * Set the IntegrationServiceProvider for a given server
   * @param server {IntegrationServer}
   * @param provider {IntegrationServiceProvider}
   */
  setServiceProvider (server, provider) {
    debug && logger.info('IntegrationService.setServiceProvider:', server._id, server.title);
    
    this.providers[ server._id ] = provider;
  },
  
  /**
   * Retrieve the IntegrationServiceProvider for a given server
   * @param server {IntegrationServer}
   */
  getServiceProvider (server) {
    debug && logger.info('IntegrationService.getServiceProvider:', server._id, server.title);
    
    return this.providers && this.providers[ server._id ];
  },
  
  /**
   * Handle a change to a service provider
   * Really only care about active/inactive, other changes are handled by the provider itself
   * @param {*} newDoc
   * @param {*} oldDoc
   */
  updateServiceProvider (newDoc, oldDoc) {
    logger.info('IntegrationService.updateServiceProvider:', newDoc._id, newDoc.title, newDoc.isActive);
    let self = this;
    
    // Respond to server active flag changes
    if (newDoc.isActive !== oldDoc.isActive) {
      if (newDoc.isActive) {
        self.createServiceProvider(newDoc);
      } else {
        self.destroyServiceProvider(newDoc);
      }
    }
  },
  
  /**
   * Destroy a service provider
   * @param {*} server
   */
  destroyServiceProvider (server) {
    logger.info('IntegrationService.destroyServiceProvider:', server._id, server.title);
    let self     = this,
        provider = self.getServiceProvider(server);
    
    if (provider) {
      provider.destroy();
      delete self.providers[ server._id ];
    }
  },
  
  /**
   * Attempt to authenticate a service provider
   * @param server
   * @param username
   * @param password
   */
  authenticateServiceProvider (server, username, password) {
    logger.info('IntegrationService.authenticateServiceProvider:', server._id, server.title, username);
    let self     = this,
        provider = self.getServiceProvider(server);
    
    if (provider) {
      return provider.authenticate(username, password);
    } else {
      throw new Meteor.Error(404, 'Service Provider not found');
    }
  },
  
  /**
   * Attempt to log out of a service provider
   * @param server
   */
  unAuthenticateServiceProvider (server) {
    logger.info('IntegrationService.authenticateServiceProvider:', server._id, server.title);
    let self     = this,
        provider = self.getServiceProvider(server);
    
    if (provider) {
      return provider.unAuthenticate();
    } else {
      throw new Meteor.Error(404, 'Service Provider not found');
    }
  },
  
  /**
   * Check the health of a service provider
   * @param server
   */
  checkServiceProviderHealth (server) {
    logger.info('IntegrationService.checkServiceProviderHealth:', server._id, server.title);
    let self     = this,
        provider = self.getServiceProvider(server);
    
    if (provider) {
      return provider.checkHealth();
    } else {
      throw new Meteor.Error(404, 'Service Provider not found');
    }
  },
  
  /**
   * Fetch data from a service provider
   * @param server
   * @param request
   */
  fetchData (server, request) {
    debug && logger.info('IntegrationService.fetchData:', server._id, server.title);
    let self     = this,
        provider = self.getServiceProvider(server);
    
    if (provider) {
      return provider.fetchData(request);
    } else {
      throw new Meteor.Error(404, 'Service Provider not found');
    }
  },
  
  /**
   * Test a project integration including remote query and item processing
   * @param integration {Integration}
   * @param details {Object}
   */
  testIntegration (integration, details) {
    logger.info('IntegrationService.testIntegration:', integration._id);
    let self     = this,
        provider = self.getServiceProvider(integration.server());
    
    return provider.testIntegration(integration, details)
  },
  
  /**
   * Stop all integrations
   */
  stop () {
    logger.info('IntegrationService.stop');
    let self = this;
    
    // Update the IntegrationService health tracker
    self.serverObserver.stop();
  }
};