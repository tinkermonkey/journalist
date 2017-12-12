import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Auth } from '../../auth';
import { Integrations } from '../integrations';
import { IntegrationImportFunctions } from '../integration_import_functions';
import { IntegrationServers } from '../integration_servers';
import { IntegrationService } from '../../../modules/integration_service/integration_service';

Meteor.methods({
  /**
   * Add an integration
   * @param projectId
   * @param integrationType
   * @param itemType
   */
  addIntegration (projectId, integrationType, itemType) {
    console.log('addIntegration:', projectId, integrationType, itemType);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(projectId, String);
    check(integrationType, String);
    check(itemType, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Insert the project percent
      Integrations.insert({
        projectId      : projectId,
        integrationType: integrationType,
        itemType       : itemType
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
      // Delete the contributor
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
      // Delete the contributor
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
   * @param itemType
   */
  addIntegrationImportFunction (title, integrationType, itemType) {
    console.log('addIntegrationImportFunction:', title, integrationType, itemType);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    check(integrationType, Number);
    check(itemType, Number);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Insert the project percent
      IntegrationImportFunctions.insert({
        title          : title,
        integrationType: integrationType,
        itemType       : itemType
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
      // Delete the contributor
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
  }
});
