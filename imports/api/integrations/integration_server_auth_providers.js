import { Mongo }    from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

/**
 * ============================================================================
 * IntegrationServerAuthProvider
 * ============================================================================
 */
export const IntegrationServerAuthProvider = new SimpleSchema({
  serverId         : {
    type: String
  },
  isEnabled        : {
    type        : Boolean,
    defaultValue: false
  },
  loginFunctionName: {
    type    : String,
    optional: true
  },
  authServiceKey   : {
    type    : String,
    optional: true
  },
  authConfig       : {
    type    : String,
    optional: true
  }
});

export const IntegrationServerAuthProviders = new Mongo.Collection('integration_server_auth_providers');
IntegrationServerAuthProviders.attachSchema(IntegrationServerAuthProvider);

/**
 * Helpers
 */
IntegrationServerAuthProviders.helpers({
  compileAuthConfig(){
    return eval("() => { return " + this.authConfig + " }")()
  }
});