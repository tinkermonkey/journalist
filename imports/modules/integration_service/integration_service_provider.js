import { Ping } from 'meteor/frpz:ping';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { Contributors } from '../../api/contributors/contributors';
import { HealthTracker } from '../../api/system_health_metrics/server/health_tracker';
import { ImportedItems, ImportedItemTestSchema } from '../../api/imported_items/imported_items';
import { IntegrationServerCaches } from '../../api/integrations/integration_server_caches';
import { IntegrationServers } from '../../api/integrations/integration_servers';
import { IntegrationTypes } from '../../api/integrations/integration_types';
import { UserTypes } from '../../api/users/user_types';
import { ConfluenceIntegrator } from '../../api/integrations/integrators/confluence_integrator';
import { JiraIntegrator } from '../../api/integrations/integrators/jira_integrator';

const { URL } = require('url');

let debug = true;

export class IntegrationServiceProvider {
  constructor (server) {
    console.log('Creating new IntegrationServiceProvider:', server._id, server.title);
    let self = this;
    
    // Store the document
    self.server = server;
    
    // Initialize the local cache of integration data
    self.cache = { contributors: {} };
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
   * Return the query definitions for an integration type
   * @param integrationType
   */
  static queryDefinitions (integrationType) {
    switch (integrationType) {
      case IntegrationTypes.jira:
        return JiraIntegrator.queryDefinitions();
      case IntegrationTypes.confluence:
        return ConfluenceIntegrator.queryDefinitions();
    }
  }
  
  /**
   * Fetch the map of integration calls that can be made for this integration
   */
  integrationCallMap(){
    debug && console.log('IntegrationServiceProvider.integrationCallMap:', this.server._id, this.server.title);
    let self = this;
    
    return self.integrator.integrationCallMap();
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
    
    if (value) {
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
    } else {
      console.error('IntegrationServiceProvider.storeCachedItem passed an empty value for key:', key);
    }
  }
  
  /**
   * Pass an item through an import function to produce an importedItem
   * @param importFunction
   * @param processedItem
   */
  importItem (importFunction, processedItem) {
    debug && console.log('IntegrationServiceProvider.importItem:', this.server._id, this.server.title);
    let self = this;
    
    // Attempt to process the item through the import function
    try {
      let importFn     = new Function('processedItem', importFunction.code),
          importedItem = importFn(processedItem);
      
      // Store the full processedItem as the document field
      importedItem.document = processedItem;
      
      // Validate the processed item against the importedItem schema
      try {
        ImportedItemTestSchema.validate(importedItem);
        
        return {
          success: true,
          item   : importedItem
        }
      } catch (e) {
        return {
          success: false,
          error  : e.toString(),
          item   : importedItem
        }
      }
    } catch (e) {
      return {
        success: false,
        error  : e.toString()
      }
    }
  }
  
  /**
   * Pass an array of items through an import function to produce an array of importedItems
   * @param importFunction
   * @param processedItems
   */
  importItems (importFunction, processedItems) {
    debug && console.log('IntegrationServiceProvider.importItems:', this.server._id, this.server.title, processedItems.length);
    let self   = this,
        result = {
          items   : [],
          failures: []
        };
    
    // import each of the processed items
    processedItems.forEach((item) => {
      let importResult = self.importItem(importFunction, item);
      if (importResult.success === true) {
        result.items.push(importResult.item)
      } else {
        importResult.processedItem = item;
        result.failures.push(importResult)
      }
    });
    
    return result
  }
  
  /**
   * Test an import function by fetching an issue and running it through the pipeline
   * @param importFunction
   * @param identifier
   */
  testImportFunction (importFunction, identifier) {
    debug && console.log('IntegrationServiceProvider.testImportFunction:', this.server._id, this.server.title);
    let self          = this,
        rawItem       = self.integrator.fetchItem(identifier),
        processedItem = self.postProcessItem(rawItem);
    
    return {
      rawItem      : rawItem,
      processedItem: processedItem,
      importResult : self.importItem(importFunction, processedItem)
    }
  }
  
  /**
   * Test an integration by executing the query to fetch some issues and returning the imported (but not stored) results
   * @param integration
   * @param details
   */
  testIntegration (integration, details) {
    debug && console.log('IntegrationServiceProvider.testIntegration:', this.server._id, this.server.title, integration._id);
    let self = this;
    
    return self.integrator.testIntegration(integration, details)
  }
  
  /**
   * Post process a raw issue
   * @param rawItem
   */
  postProcessItem (rawItem) {
    debug && console.log('IntegrationServiceProvider.postProcessItem:', this.server._id, this.server.title);
    let self          = this,
        processedItem = self.integrator.postProcessItem(rawItem);
    
    self.processItemForContributors(processedItem);
    
    return processedItem;
  }
  
  /**
   * Replace all of the raw contributor identifiers on an issue with contributor _ids
   * @param processedItem
   */
  processItemForContributors (processedItem) {
    debug && console.log('IntegrationServiceProvider.processItemForContributors:', this.server._id, this.server.title);
    let self = this;
    
    self.integrator.processItemForContributors(processedItem);
  }
  
  /**
   * Store an imported item
   * @param item
   */
  storeImportedItem (item) {
    debug && console.log('IntegrationServiceProvider.storeImportedItem:', this.server._id, this.server.title, item && item.identifier);
    let self = this;
    
    ImportedItems.upsert({}, {
      $set: item
    });
  }
  
  /**
   * Given a key identifier (email address, etc), find or create a contributor record to match
   * Maintain a local cache of contributors that have been identified
   * @param key
   * @param email
   * @param name
   * @param rawData
   */
  findOrCreateContributor (key, email, name, rawData) {
    debug && console.log('IntegrationServiceProvider.findOrCreateContributor:', this.server._id, this.server.title, key);
    let self = this;
    
    // Validate the data to make sure it's safe to proceed
    if (!_.isString(key) && key.length && _.isString(email) && email.length && _.isString(name) && name.length) {
      console.error('IntegrationServiceProvider.findOrCreateContributor passed invalid data:', key, email, name);
      return rawData;
    }
    
    // Check the local cache
    if (self.cache.contributors[ key ]) {
      return self.cache.contributors[ key ]
    } else {
      // Check the db for a known contributor
      let identifier  = self.server.contributorIdentifier(key),
          contributor = Contributors.findOne({ identifiers: identifier });
      
      if (contributor) {
        self.cache.contributors[ key ] = contributor._id;
      } else {
        // Check for a contributor with this email address
        contributor = Contributors.findOne({ email: email });
        
        if (contributor) {
          self.cache.contributors[ key ] = contributor._id;
        } else {
          // Create the contributor
          let doc                         = {
            email      : email,
            name       : name,
            identifiers: [ identifier ],
            profiles   : {},
            usertype   : UserTypes.contributor
          };
          doc.profiles[ self.server._id ] = _.isObject(rawData) ? rawData : { data: rawData };
          self.cache.contributors[ key ]  = Contributors.insert(doc);
        }
      }
      return self.cache.contributors[ key ]
    }
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