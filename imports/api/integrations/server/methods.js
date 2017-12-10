import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Auth } from '../../auth';
import { Integrations } from '../integrations';
import { IntegrationServers } from '../integration_servers';
import { IntegrationService } from '../../../modules/integration_service/integration_service';

Meteor.methods({
  /**
   * Add an integration
   * @param projectId
   * @param integrationType
   * @param issueType
   */
  addIntegration (projectId, integrationType, issueType) {
    console.log('addIntegration:', projectId, integrationType, issueType);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(projectId, String);
    check(integrationType, String);
    check(issueType, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Insert the project percent
      Integrations.insert({
        projectId: projectId,
        integrationType: integrationType,
        issueType: issueType
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
        title: title,
        integrationType: integrationType,
        baseUrl: baseUrl
      });
    } else {
      console.error('Non-admin user tried to add an integration server:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove an integration server
   * @param integrationServerId
   */
  deleteIntegrationServer (integrationServerId) {
    console.log('deleteIntegrationServer:', integrationServerId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(integrationServerId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Delete the contributor
      IntegrationServers.remove(integrationServerId);
    } else {
      console.error('Non-admin user tried to delete an integration server:', user.username, integrationServerId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit an integration server record
   * @param integrationServerId
   * @param key
   * @param value
   */
  editIntegrationServer (integrationServerId, key, value) {
    console.log('editIntegrationServer:', integrationServerId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(integrationServerId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the server record to make sure this is authorized
    let server = IntegrationServers.findOne(integrationServerId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (server) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        IntegrationServers.update(integrationServerId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit an integration server:', user.username, key, value, integrationServerId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Authenticate to an integration server
   * @param integrationServerId
   * @param username
   * @param password
   */
  authenticateIntegrationServer(integrationServerId, username, password){
    console.log('authenticateIntegrationServer:', integrationServerId, username);
    let user = Auth.requireAuthentication();
  
    // Validate the data is complete
    check(integrationServerId, String);
    check(username, String);
    check(password, String);
  
    // Get the server record to make sure this is authorized
    let server = IntegrationServers.findOne(integrationServerId);
  
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (server) {
        // Check to see if the server is already authenticated
        // Pass the request on the to IntegrationService
        let result = IntegrationService.authenticateServiceProvider(server, username, password);
        if(result.success){
          // Update the server health quickly
          Meteor.defer(() => {
            IntegrationService.checkServiceProviderHealth(server)
          });
        }

        return result;
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to authenticate an integration server:', user.username, username, integrationServerId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Log out of an integration server
   * @param integrationServerId
   */
  unAuthenticateIntegrationServer(integrationServerId){
    console.log('unAuthenticateIntegrationServer:', integrationServerId);
    let user = Auth.requireAuthentication();
  
    // Validate the data is complete
    check(integrationServerId, String);
  
    // Get the server record to make sure this is authorized
    let server = IntegrationServers.findOne(integrationServerId);
  
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (server) {
        // Pass the request on the to IntegrationService
        return IntegrationService.unAuthenticateServiceProvider(server);
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to authenticate an integration server:', user.username, username, integrationServerId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Fetch some data from an integration server
   * @param integrationServerId
   * @param request
   */
  fetchIntegrationServerData(integrationServerId, request){
    console.log('fetchIntegrationServerData:', integrationServerId);
    let user = Auth.requireAuthentication();
  
    // Validate the data is complete
    check(integrationServerId, String);
  
    // Get the server record to make sure this is authorized
    let server = IntegrationServers.findOne(integrationServerId);
  
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (server) {
        // Pass the request on the to IntegrationService
        return IntegrationService.fetchData(server, request);
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to authenticate an integration server:', user.username, username, integrationServerId);
      throw new Meteor.Error(403);
    }
  }
});
