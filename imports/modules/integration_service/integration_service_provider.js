import { Ping } from 'meteor/frpz:ping';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { IntegrationServers } from '../../api/integrations/integration_servers';
import { IntegrationTypes } from '../../api/integrations/integration_types';
import { ConfluenceIntegrator } from '../../api/integrations/integrators/confluence_integrator';
import { JiraIntegrator } from '../../api/integrations/integrators/jira_integrator';
import { HealthTracker } from '../../api/system_health_metrics/server/health_tracker';
import { IntegrationServerCaches } from '../../api/integrations/integration_server_caches';

const { URL } = require('url');

let debug = true;

export class IntegrationServiceProvider {
  constructor (server) {
    console.log('Creating new IntegrationServiceProvider:', server._id, server.title);
    let self = this;
    
    // Store the document
    self.server = server;
  
    // Initialize the local cache of integration data
    self.cache = {};
    self.loadCachedData();
    
    // Parse the base url
    self.parseBaseUrl();
    
    // Initialize the health tracker
    self.trackerKey = 'integration-server-' + server._id;
    HealthTracker.add(self.trackerKey, self.server.title, 'server');
    
    // Set the server auth flag to unauthenticated
    IntegrationServers.update({ _id: self.server._id }, { $set: { isAuthenticated: false } });
    
    // Observe the collection for document updates
    // Needs to be deferred because you can't create observers in a call stack from another observer
    Meteor.defer(() => {
      self.observer = IntegrationServers.find({ _id: self.server._id }).observe({
        changed (newDoc, oldDoc) {
          debug && console.log('IntegrationServiceProvider.observer.changed:', newDoc._id, newDoc.title);
          
          // Update the local cache of the document
          self.server = newDoc;
          
          // Parse the URL if it changed
          if (self.server.baseUrl !== oldDoc.baseUrl) {
            self.parseBaseUrl();
          } else if (self.server.healthCheckFrequency !== oldDoc.healthCheckFrequency) {
            self.updateHealthCheckJob();
          }
        }
      });
    });
    
    // Create the Integrator
    switch (self.server.integrationType) {
      case IntegrationTypes.jira:
        self.integrator = new JiraIntegrator(self);
        break;
      case IntegrationTypes.confluence:
        self.integrator = new ConfluenceIntegrator(self);
        break;
    }
    
    // Schedule the health check job
    self.updateHealthCheckJob();
    
    // Schedule the cache service job
    self.updateCacheServiceJob();
  }
  
  /**
   * Create or update the cron job for updating the server health
   */
  updateHealthCheckJob () {
    debug && console.log('IntegrationServiceProvider.updateHealthCheckJob:', this.server._id, this.server.title);
    let self = this;
    
    SyncedCron.remove(self.trackerKey);
    
    SyncedCron.add({
      name: self.trackerKey,
      schedule (parser) {
        let parserText = self.server.healthCheckFrequency || 'every 5 minutes';
        debug && console.log('IntegrationServiceProvider.updateHealthCheckJob setting schedule:', self.server._id, self.server.title, "'", parserText, "'");
        return parser.text(parserText);
      },
      job () {
        self.checkHealth();
      }
    });
  }
  
  /**
   * Create or update the cron job for updating the cached data for this server
   */
  updateCacheServiceJob () {
    debug && console.log('IntegrationServiceProvider.updateCacheServiceJob:', this.server._id, this.server.title);
    let self = this;
    
    SyncedCron.remove(self.trackerKey + '-cache');
    
    SyncedCron.add({
      name: self.trackerKey + '-cache',
      schedule (parser) {
        let parserText = self.server.cacheUpdateFrequency || 'every 30 minutes';
        debug && console.log('IntegrationServiceProvider.updateCacheServiceJob setting schedule:', self.server._id, self.server.title, "'", parserText, "'");
        return parser.text(parserText);
      },
      job () {
        self.updateCachedData();
      }
    });
  }
  
  /**
   * Check the general health of the connection to this server
   */
  checkHealth () {
    debug && console.log('IntegrationServiceProvider.checkHealth:', this.server._id, this.server.title);
    let self    = this,
        healthy = true,
        details = {};
    
    // Make sure there's something to connect to
    if (self.url && self.url.hostname) {
      // Ping the server
      debug && console.log('IntegrationServiceProvider.checkHealth pinging server:', self.url.hostname, self.url.port);
      try {
        let status = Ping.host(self.url.hostname, 3);
        healthy    = status.online === true;
        if (!healthy) {
          debug && console.log('IntegrationServiceProvider.checkHealth ping status:', status);
          details.error = "Server did not respond to ping requests";
        }
      } catch (e) {
        console.error('IntegrationServiceProvider.checkHealth ping failed:', self.url.hostname, e);
        HealthTracker.update(self.trackerKey, false, { error: 'Ping failed' });
        return;
      }
      
      // Check an authenticated end point to make sure the server is authenticated
      if (healthy) {
        let authResult = self.integrator.checkAuthentication();
        healthy        = authResult.success === true;
        if (!healthy) {
          debug && console.log('IntegrationServiceProvider.checkHealth auth result:', authResult);
          details.error = "Server is not authenticated";
          IntegrationServers.update({ _id: self.server._id }, { $set: { isAuthenticated: false } });
        }
      }
      
      // Update the status
      HealthTracker.update(self.trackerKey, healthy, details);
    } else {
      HealthTracker.update(self.trackerKey, false, { error: 'No valid URL for server' });
    }
  }
  
  /**
   * Authenticate to the server
   * @param username
   * @param password
   */
  authenticate (username, password) {
    debug && console.log('IntegrationServiceProvider.authenticate:', this.server._id, this.server.title, username);
    let self       = this,
        authResult = self.integrator.authenticate(username, password);
    
    // Update the authentication status
    IntegrationServers.update({ _id: self.server._id }, { $set: { isAuthenticated: authResult.success === true } });
    
    return authResult;
  }
  
  /**
   * Authenticate to the server
   */
  unAuthenticate () {
    debug && console.log('IntegrationServiceProvider.unAuthenticate:', this.server._id, this.server.title);
    let self   = this,
        result = self.integrator.unAuthenticate();
    
    // Update the authentication status
    IntegrationServers.update({ _id: self.server._id }, { $set: { isAuthenticated: false } });
    
    return result;
  }
  
  /**
   * Re-authenticate to the server
   */
  reAuthenticate () {
    debug && console.log('IntegrationServiceProvider.reAuthenticate:', this.server._id, this.server.title);
    let self       = this,
        authResult = self.integrator.reAuthenticate(self.server.authData);
    
    // Update the authentication status
    IntegrationServers.update({ _id: self.server._id }, { $set: { isAuthenticated: authResult.success === true } });
    
    return authResult;
  }
  
  /**
   * Store authentication data for this server
   * @param data
   */
  storeAuthData (data) {
    debug && console.log('IntegrationServiceProvider.storeAuthData:', this.server._id, this.server.title);
    let self = this;
    
    IntegrationServers.update({ _id: self.server._id }, { $set: { authData: data } });
  }
  
  /**
   * Clear stored authentication data for this server
   */
  clearAuthData () {
    console.warn('IntegrationServiceProvider.clearAuthData:', this.server._id, this.server.title);
    let self = this;
    
    IntegrationServers.update({ _id: self.server._id }, {
      $unset: { authData: true },
      $set  : { isAuthenticated: false }
    });
  }
  
  /**
   * Fetch data from an integration server
   * @param request
   */
  fetchData (request) {
    debug && console.log('IntegrationServiceProvider.fetchData:', this.server._id, this.server.title);
    let self = this;
    
    // Fetch the data
    return self.integrator.fetchData(request);
  }
  
  /**
   * Pull all of the cached data out of the db
   */
  loadCachedData () {
    debug && console.log('IntegrationServiceProvider.loadCachedData:', this.server._id, this.server.title);
    let self = this;
    
    IntegrationServerCaches.find({ serverId: self.server._id }).forEach((cachedItem) => {
      self.cache[ cachedItem.key ] = cachedItem.value;
    });
  }
  
  /**
   * Update all of the cached data for this integration provider
   */
  updateCachedData () {
    debug && console.log('IntegrationServiceProvider.updateCachedData:', this.server._id, this.server.title);
    let self = this;
    
    return self.integrator.updateCachedData();
  }
  
  /**
   * Store some cached data for this server
   * @param key
   * @param value
   */
  storeCachedItem (key, value) {
    debug && console.log('IntegrationServiceProvider.storeCachedItem:', this.server._id, this.server.title);
    let self = this;
    
    // Update the local in memory value
    self.cache[ key ] = value;
    
    // Update the stored value
    IntegrationServerCaches.upsert({
      serverId: self.server._id,
      key     : key
    }, {
      $set: {
        serverId: self.server._id,
        key     : key,
        value   : value
      }
    });
  }
  
  /**
   * Test an import function
   * @param importFunction
   * @param identifier
   */
  testImportFunction (importFunction, identifier) {
    debug && console.log('IntegrationServiceProvider.testImportFunction:', this.server._id, this.server.title);
    let self = this;
    
    return self.integrator.testImportFunction(importFunction, identifier);
  }
  
  /**
   * Parse the server's baseUrl into a URL object
   */
  parseBaseUrl () {
    debug && console.log('IntegrationServiceProvider.parseBaseUrl:', this.server._id, this.server.title);
    let self = this;
    
    // Parse the base url
    try {
      self.url = new URL(self.server.baseUrl);
    } catch (e) {
      console.error('IntegrationServiceProvider could not parse baseUrl:', self.server.baseUrl, e);
    }
  }
  
  /**
   * Shut this provider down in prep for being deleted
   */
  destroy () {
    console.log('IntegrationServiceProvider.destroy:', this.server._id, this.server.title);
    let self = this;
    
    // Shut down the change observer
    self.observer.stop();
    
    // Remove the HealthTracker data
    HealthTracker.remove(self.trackerKey);
    
    // Remove the cron job to check status & cache
    SyncedCron.remove(self.trackerKey);
    SyncedCron.remove(self.trackerKey + '-cache');
  }
}