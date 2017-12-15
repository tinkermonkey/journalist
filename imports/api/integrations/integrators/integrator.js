import { Meteor } from "meteor/meteor";

/**
 * Base class from which to build various integrations
 */
export class Integrator {
  constructor (provider) {
    this.provider = provider;
  }
  
  /**
   * Authenticate this integrator
   * @param username
   * @param password
   */
  authenticate (username, password) {
    throw new Meteor.Error(500, 'Integrator generic method called, must be overridden');
  }
  
  /**
   * Log out from this integration
   */
  unAuthenticate () {
    throw new Meteor.Error(500, 'Integrator generic method called, must be overridden');
  }
}