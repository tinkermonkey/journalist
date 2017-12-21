import { SyncedCron } from 'meteor/percolate:synced-cron';
import { IntegrationAgent } from './integration_agent';
import { Integrations } from '../../api/integrations/integrations';
import { IntegrationServiceProvider } from './integration_service_provider';
import { IntegrationServers } from '../../api/integrations/integration_servers';
import { HealthTracker } from '../../api/system_health_metrics/server/health_tracker';

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
    service.agents    = {};
    
    // Start Synced Cron
    SyncedCron.stop(); // Clear everything out
    SyncedCron.start();
    
    // Monitor the IntegrationServers collection to respond to additions, deletions, and modifications
    service.serverObserver = IntegrationServers.find({}).observe({
      added (server) {
        debug && console.log('IntegrationService.serverObserver.added:', server._id, server.title);
        Meteor.defer(() => {
          service.createServiceProvider(server);
        });
      },
      changed (newDoc, oldDoc) {
        debug && console.log('IntegrationService.serverObserver.changed:', newDoc._id, newDoc.title);
        Meteor.defer(() => {
          service.updateServiceProvider(newDoc, oldDoc);
        });
      },
      removed (server) {
        console.log('IntegrationService.serverObserver.removed:', server._id, server.title);
        Meteor.defer(() => {
          service.destroyServiceProvider(server);
        });
      }
    });
    
    // Monitor the Integrations collection to respond to additions, deletions, and modifications
    service.integrationObserver = Integrations.find({}).observe({
      added (integration) {
        debug && console.log('IntegrationService.integrationObserver.added:', integration._id);
        Meteor.defer(() => {
          service.createIntegrationAgent(integration);
        });
      },
      changed (newDoc, oldDoc) {
        debug && console.log('IntegrationService.integrationObserver.changed:', newDoc._id);
        Meteor.defer(() => {
          service.updateIntegrationAgent(newDoc, oldDoc);
        });
      },
      removed (integration) {
        console.log('IntegrationService.integrationObserver.removed:', integration._id);
        Meteor.defer(() => {
          service.destroyIntegrationAgent(integration);
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
    console.log('IntegrationService.createServiceProvider:', server._id, server.title);
    let service = this;
    
    // Create the service if the server is active
    if (server.isActive) {
      let provider = service.getServiceProvider(server);
      if (provider == null) {
        // Create the service provider record
        service.setServiceProvider(server, new IntegrationServiceProvider(server));
        
        // Try to re-authenticate
        service.getServiceProvider(server).reAuthenticate();
        
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
   * @param server {IntegrationServer}
   * @param provider {IntegrationServiceProvider}
   */
  setServiceProvider (server, provider) {
    debug && console.log('IntegrationService.setServiceProvider:', server._id, server.title);
    
    this.providers[ server._id ] = provider;
  },
  
  /**
   * Retrieve the IntegrationServiceProvider for a given server
   * @param server {IntegrationServer}
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
    let service  = this,
        provider = service.getServiceProvider(server);
    
    if (provider) {
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
    let service  = this,
        provider = service.getServiceProvider(server);
    
    if (provider) {
      return provider.unAuthenticate();
    } else {
      throw new Meteor.Error(404, "Service Provider not found");
    }
  },
  
  /**
   * Check the health of a service provider
   * @param server
   */
  checkServiceProviderHealth (server) {
    console.log('IntegrationService.checkServiceProviderHealth:', server._id, server.title);
    let service  = this,
        provider = service.getServiceProvider(server);
    
    if (provider) {
      return provider.checkHealth();
    } else {
      throw new Meteor.Error(404, "Service Provider not found");
    }
  },
  
  /**
   * Create a new integration agent
   * @param {*} integration
   */
  createIntegrationAgent (integration) {
    console.log('IntegrationService.createIntegrationAgent:', integration._id);
    let service = this;
    
    // Create the service if the integration is active
    if (integration.server().isActive) {
      let agent = service.getIntegrationAgent(integration);
      if (agent == null) {
        // Create the integration agent record
        service.setIntegrationAgent(integration, new IntegrationAgent(integration));
        
        // Update the health of the agent
        service.getIntegrationAgent(integration).checkHealth();
      } else {
        console.error('IntegrationService.createIntegrationAgent integration already exists:', integration._id);
      }
    } else {
      console.log('IntegrationService.createIntegrationAgent ignored because integration server is not active:', integration._id);
    }
  },
  
  /**
   * Set the IntegrationAgent for a given integration
   * @param integration {IntegrationServer}
   * @param agent {IntegrationAgent}
   */
  setIntegrationAgent (integration, agent) {
    debug && console.log('IntegrationService.setIntegrationAgent:', integration._id);
    
    this.agents[ integration._id ] = agent;
  },
  
  /**
   * Retrieve the IntegrationAgent for a given integration
   * @param integration {IntegrationServer}
   */
  getIntegrationAgent (integration) {
    debug && console.log('IntegrationService.getIntegrationAgent:', integration._id);
    
    return this.agents && this.agents[ integration._id ];
  },
  
  /**
   * Handle a change to a integration agent
   * Really only care about active/inactive, other changes are handled by the provider itself
   * @param {*} newDoc
   * @param {*} oldDoc
   */
  updateIntegrationAgent (newDoc, oldDoc) {
    console.log('IntegrationService.updateIntegrationAgent:', newDoc._id);
    let service = this;
    
    // Respond to integration active flag changes
    /*
    if (newDoc.isActive !== oldDoc.isActive) {
      if (newDoc.isActive) {
        service.createIntegrationAgent(newDoc);
      } else {
        service.destroyIntegrationAgent(newDoc);
      }
    }
    */
  },
  
  /**
   * Destroy a service provider
   * @param {*} integration
   */
  destroyIntegrationAgent (integration) {
    console.log('IntegrationService.destroyIntegrationAgent:', integration._id);
    let service = this,
        agent   = service.getServiceProvider(integration);
    
    if (agent) {
      agent.destroy();
      delete service.agents[ integration._id ];
    }
  },
  
  /**
   * Fetch data from a service provider
   * @param server
   * @param request
   */
  fetchData (server, request) {
    debug && console.log('IntegrationService.fetchData:', server._id, server.title);
    let service  = this,
        provider = service.getServiceProvider(server);
    
    if (provider) {
      return provider.fetchData(request);
    } else {
      throw new Meteor.Error(404, "Service Provider not found");
    }
  },
  
  /**
   * Test a project integration including remote query and item processing
   * @param integration {Integration}
   * @param details {Object}
   */
  testIntegration (integration, details) {
    console.log('IntegrationService.testIntegration:', integration._id);
    let service  = this,
        provider = service.getServiceProvider(integration.server());
    
    return provider.testIntegration(integration, details)
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