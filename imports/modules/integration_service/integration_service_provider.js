import { Ping } from 'meteor/frpz:ping';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { IntegrationServers } from '../../api/integrations/integration_servers';
import { IntegrationTypes } from '../../api/integrations/integration_types';
import { ConfluenceIntegrator } from '../../api/integrations/integrators/confluence_integrator';
import { JiraIntegrator } from '../../api/integrations/integrators/jira_integrator';
import { HealthTracker } from '../../api/system_health_metrics/server/health_tracker';

const { URL } = require('url');

let debug = true;

export class IntegrationServiceProvider {
  constructor (server) {
    console.log('Creating new IntegrationServiceProvider:', server._id, server.title);
    let self = this;
    
    // Store the document
    self.server = server;
    
    // Parse the base url
    self.parseBaseUrl();
    
    // Initialize the health tracker
    self.trackerKey = 'integration-server-' + server._id;
    HealthTracker.add(self.trackerKey, self.server.title, 'server');
    
    // Set the server auth flag to unauthenticated
    IntegrationServers.update({ _id: server._id }, { $set: { isAuthenticated: false } });
    
    // Observe the collection for document updates
    // Needs to be deferred because you can't create observers in a call stack from another observer
    Meteor.defer(() => {
      self.observer = IntegrationServers.find({ _id: server._id }).observe({
        changed (newDoc, oldDoc) {
          console.log('IntegrationServiceProvider.observer.changed:', newDoc._id, newDoc.title);
          
          // Update the local cache of the document
          self.server = newDoc;
          
          // Parse the URL if it changed
          if (self.server.baseUrl !== oldDoc.baseUrl) {
            self.parseBaseUrl();
          }
        }
      });
    });
    
    // Add the cron job to monitor this server periodically
    SyncedCron.add({
      name: self.trackerKey,
      schedule (parser) {
        return parser.text('every 90 seconds');
      },
      job () {
        console.log('SyncedCron job running:', self.trackerKey);
        self.checkHealth();
      }
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
  }
  
  /**
   * Check the general health of the connection to this server
   */
  checkHealth () {
    debug && console.log('IntegrationServiceProvider.checkHealth:', this.server._id, this.server.title);
    let self    = this,
        healthy = true;
    
    // Make sure there's something to connect to
    if (self.url && self.url.hostname) {
      // Ping the server
      debug && console.log('IntegrationServiceProvider.checkHealth pinging server:', self.url.hostname, self.url.port);
      try {
        let status = Ping.host(self.url.hostname, 3);
        debug && console.log('IntegrationServiceProvider.checkHealth ping status:', status);
        healthy = status.online === true;
        if (!healthy && !debug) {
          console.warn('IntegrationServiceProvider.checkHealth ping not healthy:', status);
        }
      } catch (e) {
        console.error('IntegrationServiceProvider.checkHealth ping failed:', self.url.hostname, e);
        HealthTracker.update(self.trackerKey, false, { error: 'Ping failed' });
        return;
      }
      
      // Do a quick check of the server web services to make sure the server is responding
      if (healthy) {
      
      }
      
      // Check an authenticated end point to make sure the server is authenticated
      if (healthy) {
      
      }
      
      // Update the status
      HealthTracker.update(self.trackerKey, healthy);
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
    let self = this;
    
    self.integrator.authenticate(username, password);
  }
  
  /**
   * Authenticate to the server
   */
  unAuthenticate () {
    debug && console.log('IntegrationServiceProvider.unAuthenticate:', this.server._id, this.server.title);
    let self = this;
    
    self.integrator.unAuthenticate();
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
    
    // Remove the cron job to check status
    SyncedCron.remove(self.trackerKey);
  }
}