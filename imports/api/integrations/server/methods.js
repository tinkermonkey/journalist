import { Meteor }                         from 'meteor/meteor';
import { check, Match }                   from 'meteor/check';
import { Auth }                           from '../../auth';
import { Integrations }                   from '../integrations';
import { IntegrationCalculatedFields }    from '../integration_calculated_fields';
import { IntegrationImportFunctions }     from '../integration_import_functions';
import { IntegrationServers }             from '../integration_servers';
import { IntegrationService }             from '../../../modules/integration_service/integration_service';
import { IntegrationServerAuthProviders } from '../integration_server_auth_providers';

Meteor.methods({
  /**
   * Add an integration
   * @param projectId
   * @param serverId
   * @param itemType
   */
  addIntegration (projectId, serverId, itemType) {
    console.log('addIntegration:', projectId, serverId, itemType);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(projectId, String);
    check(serverId, String);
    check(itemType, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Insert the project percent
      Integrations.insert({
        projectId: projectId,
        serverId : serverId,
        itemType : itemType
      });
    } else {
      console.error('Non-admin user tried to add an integration:', user.username, projectId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove an integration for a project
   * @param integrationId
   */
  deleteIntegration (integrationId) {
    console.log('deleteIntegration:', integrationId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(integrationId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      Integrations.remove(integrationId);
    } else {
      console.error('Non-admin user tried to delete an integration:', user.username, integrationId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit an integration record
   * @param integrationId
   * @param key
   * @param value
   */
  editIntegration (integrationId, key, value) {
    console.log('editIntegration:', integrationId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(integrationId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the definition record to make sure this is authorized
    let definition = Integrations.findOne(integrationId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (definition) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        Integrations.update(integrationId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit an integration:', user.username, key, value, integrationId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Fetch the query definitions for an integration
   * @param integrationId
   */
  getIntegrationQueryDefinitions (integrationId) {
    console.log('getIntegrationQueryDefinitions:', integrationId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(integrationId, String);
    
    // Get the import function record to make sure this is authorized
    let integration = Integrations.findOne(integrationId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (integration) {
        if (integration.serverId && integration.server()) {
          return IntegrationService.queryDefinitions(integration.server().integrationType);
        } else {
          throw new Meteor.Error(500, 'Integration does not have a valid server');
        }
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to test an integration:', user.username, integrationId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Test out an integration to see what comes back and how it's processed
   * @param integrationId
   * @param details
   */
  testIntegration (integrationId, details) {
    console.log('testIntegration:', integrationId, details);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(integrationId, String);
    check(details, Object);
    
    // Get the import function record to make sure this is authorized
    let integration = Integrations.findOne(integrationId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (integration) {
        return IntegrationService.testIntegration(integration, details);
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to test an integration:', user.username, key, integrationId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add an integration server
   * @param title
   * @param integrationType
   * @param baseUrl
   */
  addIntegrationServer (title, integrationType, baseUrl) {
    console.log('addIntegrationServer:', title, integrationType, baseUrl);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    check(integrationType, Number);
    check(baseUrl, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Insert the project percent
      IntegrationServers.insert({
        title          : title,
        integrationType: integrationType,
        baseUrl        : baseUrl
      });
    } else {
      console.error('Non-admin user tried to add an integration server:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove an integration server
   * @param serverId
   */
  deleteIntegrationServer (serverId) {
    console.log('deleteIntegrationServer:', serverId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(serverId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      IntegrationServers.remove(serverId);
    } else {
      console.error('Non-admin user tried to delete an integration server:', user.username, serverId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit an integration server record
   * @param serverId
   * @param key
   * @param value
   */
  editIntegrationServer (serverId, key, value) {
    console.log('editIntegrationServer:', serverId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(serverId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the server record to make sure this is authorized
    let server = IntegrationServers.findOne(serverId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (server) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        IntegrationServers.update(serverId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit an integration server:', user.username, key, value, serverId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Fetch the integration call map for this integration
   * @param serverId
   */
  getIntegrationServerCallMap (serverId) {
    console.log('getIntegrationCallMap:', serverId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(serverId, String);
    
    // Get the import function record to make sure this is authorized
    let server = IntegrationServers.findOne(serverId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (server) {
        return IntegrationService.getServiceProvider(server).integrationCallMap();
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to get a server call map:', user.username, serverId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Fetch a normalized list of statuses for this integration server
   * @param serverId
   */
  getIntegrationServerStatusList (serverId) {
    console.log('getIntegrationServerStatusList:', serverId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(serverId, String);
    
    // Get the import function record to make sure this is authorized
    let server = IntegrationServers.findOne(serverId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (server) {
        return IntegrationService.getServiceProvider(server).getCachedStatusList();
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to test an server:', user.username, serverId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Update the cached data for a server
   * @param serverId
   */
  updateIntegrationServerCache (serverId) {
    console.log('updateIntegrationServerCache:', serverId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(serverId, String);
    
    // Get the server record to make sure this is authorized
    let server = IntegrationServers.findOne(serverId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (server) {
        IntegrationService.getServiceProvider(server).updateCachedData();
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to update the cache of an integration server:', user.username, key, value, serverId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add an integration import function
   * @param title
   * @param integrationType
   */
  addIntegrationImportFunction (title, integrationType) {
    console.log('addIntegrationImportFunction:', title, integrationType);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    check(integrationType, Number);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Insert the project percent
      IntegrationImportFunctions.insert({
        title          : title,
        integrationType: integrationType
      });
    } else {
      console.error('Non-admin user tried to add an integration import function:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove an integration import function
   * @param functionId
   */
  deleteIntegrationImportFunction (functionId) {
    console.log('deleteIntegrationImportFunction:', functionId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(functionId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      IntegrationImportFunctions.remove(functionId);
    } else {
      console.error('Non-admin user tried to delete an integration import function:', user.username, functionId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit an integration import function record
   * @param functionId
   * @param key
   * @param value
   */
  editIntegrationImportFunction (functionId, key, value) {
    console.log('editIntegrationImportFunction:', functionId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(functionId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the import function record to make sure this is authorized
    let importFunction = IntegrationImportFunctions.findOne(functionId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (importFunction) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        IntegrationImportFunctions.update(functionId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit an integration import function:', user.username, key, functionId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add an integration calculated field
   * @param title
   */
  addIntegrationCalculatedField (title) {
    console.log('addIntegrationCalculatedField:', title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Insert the project percent
      IntegrationCalculatedFields.insert({
        title: title
      });
    } else {
      console.error('Non-admin user tried to add an integration calculated field:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove an integration calculated field
   * @param fieldId
   */
  deleteIntegrationCalculatedField (fieldId) {
    console.log('deleteIntegrationCalculatedField:', fieldId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(fieldId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      IntegrationCalculatedFields.remove(fieldId);
    } else {
      console.error('Non-admin user tried to delete an integration calculated field:', user.username, fieldId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit an integration calculated field record
   * @param fieldId
   * @param key
   * @param value
   */
  editIntegrationCalculatedField (fieldId, key, value) {
    console.log('editIntegrationCalculatedField:', fieldId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(fieldId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the calculated Field record to make sure this is authorized
    let calculatedField = IntegrationCalculatedFields.findOne(fieldId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (calculatedField) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        IntegrationCalculatedFields.update(fieldId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit an integration calculated field:', user.username, key, fieldId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Test out an import function against a server
   * @param functionId
   * @param serverId
   * @param identifier
   */
  testIntegrationImportFunction (functionId, serverId, identifier) {
    console.log('editIntegrationImportFunction:', functionId, serverId, identifier);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(functionId, String);
    check(serverId, String);
    check(identifier, String);
    
    // Get the import function record to make sure this is authorized
    let importFunction = IntegrationImportFunctions.findOne(functionId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (importFunction) {
        let server = IntegrationServers.findOne(serverId);
        
        return IntegrationService.getServiceProvider(server).testImportFunction(importFunction, identifier);
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit an integration import function:', user.username, key, functionId);
      throw new Meteor.Error(403);
    }
  },
  
  importItemAndStore (integrationId, identifier) {
    console.log('editIntegrationImportFunction:', integrationId, identifier);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(integrationId, String);
    
    // Get the import function record to make sure this is authorized
    let integration = Integrations.findOne(integrationId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (integration) {
        let provider = IntegrationService.getServiceProvider(integration.server()),
            result   = provider.testImportFunction(integration.importFunction(), identifier);
        
        if (result.importResult && result.importResult.success) {
          provider.storeImportedItem(integration._id, integration.projectId, integration.itemType, result.importResult.item);
        }
        
        return result
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit an integration import function:', user.username, key, functionId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Authenticate to an integration server
   * @param serverId
   * @param username
   * @param password
   */
  authenticateIntegrationServer (serverId, username, password) {
    console.log('authenticateIntegrationServer:', serverId, username);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(serverId, String);
    check(username, String);
    check(password, String);
    
    // Get the server record to make sure this is authorized
    let server = IntegrationServers.findOne(serverId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (server) {
        // Check to see if the server is already authenticated
        // Pass the request on the to IntegrationService
        let result = IntegrationService.authenticateServiceProvider(server, username, password);
        if (result.success) {
          // Update the server health quickly
          Meteor.defer(() => {
            IntegrationService.checkServiceProviderHealth(server)
          });
          return result.response
        } else if (result.error) {
          throw new Meteor.Error(result.error);
        }
        
        return result;
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to authenticate an integration server:', user.username, username, serverId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Log out of an integration server
   * @param serverId
   */
  unAuthenticateIntegrationServer (serverId) {
    console.log('unAuthenticateIntegrationServer:', serverId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(serverId, String);
    
    // Get the server record to make sure this is authorized
    let server = IntegrationServers.findOne(serverId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (server) {
        // Pass the request on the to IntegrationService
        let result = IntegrationService.unAuthenticateServiceProvider(server);
        if (result.success) {
          return result.response
        } else if (result.error) {
          throw new Meteor.Error(result.error)
        }
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to authenticate an integration server:', user.username, username, serverId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Fetch some data from an integration server
   * @param serverId
   * @param request
   */
  fetchIntegrationServerData (serverId, request) {
    console.log('fetchIntegrationServerData:', serverId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(serverId, String);
    
    // Get the server record to make sure this is authorized
    let server = IntegrationServers.findOne(serverId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (server) {
        // Pass the request on the to IntegrationService
        let result = IntegrationService.fetchData(server, request);
        if (result.success) {
          return result.response
        } else if (result.error) {
          throw new Meteor.Error(result.error)
        }
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to authenticate an integration server:', user.username, username, serverId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Run imported items through the processing pipeline again
   * @param integrationId
   */
  reprocessIntegrationItems (integrationId) {
    console.log('reprocessIntegrationItems:', integrationId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(integrationId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // grab the integration
      let integration = Integrations.findOne(integrationId);
      
      return IntegrationService.getServiceProvider(integration.server()).getIntegrationAgent(integration).reprocessItems();
    } else {
      console.error('Non-admin user tried to reprocess issues:', user.username, integrationId);
      throw new Meteor.Error(403);
    }
    
  },
  
  /**
   * Add an integration server auth provider
   * @param serverId
   */
  addIntegrationServerAuthProvider (serverId) {
    console.log('addIntegrationServerAuthProvider:', serverId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(serverId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Check for an existing provider config
      if(IntegrationServerAuthProviders.find({serverId: serverId}).count() === 0){
        // Insert the project percent
        IntegrationServerAuthProviders.insert({
          serverId: serverId
        });
      } else {
        throw new Meteor.Error(500)
      }
    } else {
      console.error('Non-admin user tried to add an integration server auth provider:', user.username, serverId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove an integration server auth provider
   * @param providerId
   */
  deleteIntegrationServerAuthProvider (providerId) {
    console.log('deleteIntegrationServerAuthProvider:', providerId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(providerId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      IntegrationServerAuthProviders.remove(providerId);
    } else {
      console.error('Non-admin user tried to delete an integration server auth provider:', user.username, providerId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit an integration server auth provider record
   * @param providerId
   * @param key
   * @param value
   */
  editIntegrationServerAuthProvider (providerId, key, value) {
    console.log('editIntegrationServerAuthProvider:', providerId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(providerId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the server record to make sure this is authorized
    let server = IntegrationServerAuthProviders.findOne(providerId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (server) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        IntegrationServerAuthProviders.update(providerId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit an integration server auth provider:', user.username, key, value, providerId);
      throw new Meteor.Error(403);
    }
  }
});
