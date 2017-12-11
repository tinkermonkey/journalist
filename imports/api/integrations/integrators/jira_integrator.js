import { Integrator } from './integrator';
import { IntegrationTypes } from '../integration_types';
import { Meteor } from "meteor/meteor";
import { MongoCookieStore } from './mongo_cookie_store';

// Pull in the jira connector
const JiraConnector     = require('jira-connector'),
      ToughCookie = require('tough-cookie'),
      request           = require('request'),
      useMongoStore     = false,
      debug             = true;

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
            self.cookieStore.putCookie(cookie, () => { });
          } catch (e) {
            console.error('JiraIntegrator.reAuthenticate cookie parse failed:', cookieData, e);
          }
        });
        debug && console.log('JiraIntegrator.reAuthenticate cookies:', self.cookieStore.getAllCookiesSync());
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