import { Integrator } from './integrator';
import { IntegrationTypes } from '../integration_types';
import { Meteor } from "meteor/meteor";

// Pull in the jira connector
const JiraConnector = require('jira-connector'),
      request       = require('request'),
      ToughCookie   = require('tough-cookie'),
      debug         = true;

/**
 * Integrator for pulling in Jira issues
 */
export class JiraIntegrator extends Integrator {
  constructor () {
    console.log('Creating new JiraIntegrator');
    super(...arguments);
    this.type = IntegrationTypes.jira;
    
    // Create a cookie jar
    this.cookieJar = request.jar(new ToughCookie.CookieJar());
    
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
    console.log('JiraIntegrator.authenticate creating Jira client...');
    self.client = new JiraConnector({
      host      : self.provider.url.hostname,
      basic_auth: {
        username: username,
        password: password
      },
      cookie_jar: self.cookieJar
    });
    console.log('...complete');
    
    // test it out
    try {
      console.log('JiraIntegrator.authenticate calling getMyself to check authentication:', self.client.getMyself);
      self.getMyself = Meteor.wrapAsync(self.client.getMyself);
      let result = self.getMyself();
      console.log('JiraIntegrator.authenticate getMyself result:', result);
    } catch (e) {
      console.error();
    }
    
    
  }
  
  /**
   * Log out from this integration
   */
  unAuthenticate () {
    throw new Meteor.Error(500, 'Integrator generic method called, must be overridden');
  }
}