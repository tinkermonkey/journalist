import { Integrator } from './integrator';
import { IntegrationTypes } from '../integration_types';
import { Meteor } from "meteor/meteor";
import { MongoCookieStore } from './mongo_cookie_store';
import { Util } from '../../util';

// Pull in the jira connector
const JiraConnector    = require('jira-connector'),
      ToughCookie      = require('tough-cookie'),
      request          = require('request'),
      useMongoStore    = true,
      debug            = true,
      queryDefinitions = {
        master: "Master Select Query"
      };

// Ignore self-signed errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Integrator for pulling in Jira issues
 */
export class JiraIntegrator extends Integrator {
  constructor () {
    console.log('Creating new JiraIntegrator');
    super(...arguments);
    this.type = IntegrationTypes.jira;
    
    // Create a cookie jar and load any stored data from Mongo
    if (useMongoStore) {
      this.cookieStore = new MongoCookieStore(this.provider.trackerKey);
      this.cookieStore.restoreCookies();
    } else {
      this.cookieStore                   = new ToughCookie.MemoryCookieStore();
      this.cookieStore.synchronous       = true;
      this.cookieStore.getAllCookiesSync = Meteor.wrapAsync(this.cookieStore.getAllCookies);
    }
    this.cookieJar = request.jar(this.cookieStore);
    
    return this;
  }
  
  /**
   * Return this class' query definition set
   */
  static queryDefinitions () {
    return queryDefinitions
  }
  
  /**
   * Authenticate this integrator
   * @param username
   * @param password
   */
  authenticate (username, password) {
    debug && console.log('JiraIntegrator.authenticate:', this.provider && this.provider.server.title);
    let self = this;
    
    // Create the Jira client
    self.client = new JiraConnector({
      host      : self.provider.url.hostname,
      basic_auth: {
        username: username,
        password: password
      },
      cookie_jar: self.cookieJar
    });
    
    // Test it out
    let authResult = self.checkAuthentication();
    
    // If we're authenticated
    if (authResult.success) {
      // Store the authentication token for re-use
      if (0) {
        debug && console.log('JiraIntegrator.authenticate cookies:', self.cookieStore.getAllCookiesSync());
        self.provider.storeAuthData({
          cookies: self.cookieStore.getAllCookiesSync().map((cookie) => {
            return {
              str : cookie.cookieString(),
              data: cookie.toJSON()
            }
          })
        });
      } else {
        console.error('Cookies:', self.cookieJar);
      }
    } else {
      // Make sure the server is marked unathenticated
      self.provider.clearAuthData();
    }
    
    return authResult;
  }
  
  /**
   * Authenticate this integrator using stored auth data
   * @param authData
   */
  reAuthenticate (authData) {
    console.log('JiraIntegrator.reAuthenticate:', this.provider && this.provider.server.title);
    let self = this;
    
    if (authData && authData.cookies) {
      if (!useMongoStore) {
        // Add the stored cookies to the jar
        authData.cookies.forEach((cookieData) => {
          console.log('Restoring cookie data:', cookieData);
          try {
            let cookie = request.cookie(cookieData.str);
            _.keys(cookieData.data).forEach((key) => {
              
              switch (key) {
                case 'creation':
                case 'lastAccessed':
                  cookie[ key ] = new Date(cookieData.data[ key ]);
                  break;
                default:
                  cookie[ key ] = cookieData.data[ key ];
              }
            });
            console.log('Restored cookie:', cookie.toJSON());
            /*
            self.cookieStore.putCookie(cookie, () => {
            });
            */
          } catch (e) {
            console.error('JiraIntegrator.reAuthenticate cookie parse failed:', cookieData, e);
          }
        });
        //debug && console.log('JiraIntegrator.reAuthenticate cookies:', self.cookieStore.getAllCookiesSync());
      }
      
      // Create the Jira client
      self.client = new JiraConnector({
        host      : self.provider.url.hostname,
        cookie_jar: self.cookieJar
      });
      
      // Test it out
      let authResult = self.checkAuthentication();
      
      if (!authResult.success) {
        // Make sure the server is marked unathenticated
        self.provider.clearAuthData();
      }
      
      return authResult;
    } else {
      return { success: false, error: 'No stored auth data' };
    }
  }
  
  /**
   * Verify that the client is still authenticated
   */
  checkAuthentication () {
    debug && console.log('JiraIntegrator.checkAuthentication:', this.provider && this.provider.server.title);
    let self = this;
    
    return self.fetchData('myself', 'getMyself');
  }
  
  /**
   * Update all of the cached data for this server
   */
  updateCachedData () {
    debug && console.log('JiraIntegrator.updateCachedData:', this.provider && this.provider.server.title);
    let self = this;
    
    // If connected, otherwise the cached values would be wiped
    if (self.client) {
      // Cache the list of projects
      self.provider.storeCachedItem('projectList', self.fetchData('project', 'getAllProjects').response);
      
      // Cache the list of fields and create synthetic keys based on the field name for custom fields
      let fields = self.fetchData('field', 'getAllFields').response;
      fields.forEach((field) => {
        if (field.custom) {
          let syntheticKey = Util.wordsToCamel(field.name);
          
          // Make sure it's unique
          let dupes = fields.filter((checkField) => {
            return checkField.key === syntheticKey || checkField.syntheticKey === syntheticKey
          });
          if (dupes.length) {
            syntheticKey = syntheticKey + "_" + field.schema.customId
          }
          
          field.syntheticKey = syntheticKey.toLowerCase();
        }
      });
      self.provider.storeCachedItem('fieldList', fields);
    } else {
      console.warn('JiraIntegrator.updateCachedData: ignoring request, server not connected');
    }
  }
  
  /**
   * Fetch an item from the integration server
   * @param identifier
   */
  fetchItem (identifier) {
    debug && console.log('JiraIntegrator.fetchItem:', this.provider && this.provider.server.title, identifier);
    let self = this;
    
    return self.fetchData('issue', 'getIssue', { issueKey: identifier }).response;
  }
  
  /**
   * Test out an import function
   * @param importFunction
   * @param identifier
   */
  testImportFunction (importFunction, identifier) {
    debug && console.log('JiraIntegrator.testImportFunction:', this.provider && this.provider.server.title);
    let self              = this,
        rawItem           = self.fetchData('issue', 'getIssue', { issueKey: identifier }).response,
        postProcessedItem = self.postProcessItem(rawItem);
    
    return {
      rawItem      : rawItem,
      postProcessed: postProcessedItem,
      importResult : self.provider.importItem(importFunction, postProcessedItem)
    }
  }
  
  /**
   * Post process a raw issue
   * @param rawItem
   */
  postProcessItem (rawItem) {
    debug && console.log('JiraIntegrator.postProcessItem:', this.provider && this.provider.server.title);
    let self           = this,
        processedIssue = {};
    
    // Replace all of the custom field keys with the synthetic keys
    // Replace all of the people records with links to contributors
    _.keys(rawItem).forEach((topLevelKey) => {
      if (topLevelKey === 'fields') {
        processedIssue.fields = {};
        
        _.keys(rawItem.fields).forEach((fieldKey) => {
          let processedKey = fieldKey;
          if (fieldKey.match(/customfield_/i)) {
            // look up a synthetic key
            let fieldDef = self.provider.cache.fieldList.find(field => field.key === fieldKey);
            if (fieldDef && fieldDef.syntheticKey) {
              processedKey = fieldDef.syntheticKey;
            }
          }
          
          // Deep copy the key:value over
          processedIssue.fields[ processedKey ] = JSON.parse(JSON.stringify(rawItem.fields[ fieldKey ]));
        });
      } else {
        processedIssue[ topLevelKey ] = JSON.parse(JSON.stringify(rawItem[ topLevelKey ]));
      }
    });
    
    return processedIssue
  }
  
  /**
   * Specialized post-processing to identify all contributors and replace those values with a contributor._id
   * @param processedData
   * @param level Recursion level
   */
  processItemForContributors (processedData, level) {
    debug && console.log('JiraIntegrator.processItemForContributors:', this.provider && this.provider.server.title, level || 0);
    let self = this;
    
    // Guard against out of control recursion
    level = level || 0;
    if (level > 25) {
      console.error('JiraIntegrator.processItemForContributors deep recursion:', level);
      return;
    }
    
    // Deep process this issue (recursively call this function for all fields with an object value
    _.keys(processedData).forEach((key) => {
      // If this key points to an object, analyze it
      if (_.isObject(processedData[ key ])) {
        // Process contributors down to contributor ids
        let rawValue = processedData[ key ];
        if (rawValue.self && rawValue.self.match(/\/user\?/i)) {
          processedData[ key ] = self.provider.findOrCreateContributor(rawValue.key, rawValue.emailAddress, rawValue.displayName, rawValue)
        } else {
          // If it's not a contributor, call this function on the data
          self.processItemForContributors(processedData[ key ], level + 1);
        }
      }
    });
  }
  
  /**
   * Call a client method to fetch data
   * @param {*} module
   * @param {*} method
   * @param {*} payload
   */
  fetchData (module, method, payload) {
    debug && console.log('JiraIntegrator.fetchData:', this.provider && this.provider.server.title, module, method);
    let self = this;
    
    if (_.isObject(module)) {
      payload = module.payload;
      method  = module.method;
      module  = module.module;
    }
    
    if (self.client) {
      try {
        let result = self.client[ module ][ method ](payload)
            .then((response) => {
              //debug && console.log('JiraIntegrator.fetchData success result:', module, method, response);
              return { success: true, response: response };
            }, (response) => {
              //debug && console.log('JiraIntegrator.fetchData failure result:', module, method, response);
              try {
                response = JSON.parse(response);
                
                // The error response body is typically the HTML for a webpage, so ditch it
                delete response.body;
              } catch (e) {
                debug && console.log('JiraIntegrator.fetchData failure response parse error:', module, method, response, e);
              }
              return { success: false, response: response, error: response.statusCode };
            })
            .await();
        
        //debug && console.log('JiraIntegrator.fetchData result:', module, method, result);
        
        return result
      } catch (e) {
        console.error('JiraIntegrator.fetchData error:', e);
        return { success: false, error: e.toString() };
      }
    } else {
      return { success: false, error: 'No Jira client' };
    }
  }
  
  /**
   * Log out from this integration
   */
  unAuthenticate () {
    throw new Meteor.Error(500, 'Integrator generic method called, must be overridden');
  }
}