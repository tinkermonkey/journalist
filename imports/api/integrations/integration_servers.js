import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { IntegrationTypes } from './integration_types';

/**
 * ============================================================================
 * IntegrationServers
 * ============================================================================
 */
export const IntegrationServer = new SimpleSchema({
  title          : {
    type: String
  },
  integrationType: {
    type         : Number,
    allowedValues: _.values(IntegrationTypes)
  },
  baseUrl        : {
    type: String
  },
  authData       : {
    type    : Object,
    blackbox: true,
    optional: true
  },
  healthCheckFrequency : {
    type: String,
    defaultValue: 'every 5 minutes'
  },
  cacheUpdateFrequency : {
    type: String,
    defaultValue: 'every 30 minutes'
  },
  isActive       : {
    type        : Boolean,
    optional    : true,
    defaultValue: false
  },
  isAuthenticated: {
    type        : Boolean,
    optional    : true,
    defaultValue: false
  },
  // Standard tracking fields
  dateCreated    : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy      : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified   : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy     : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const IntegrationServers = new Mongo.Collection("integration_servers");
IntegrationServers.attachSchema(IntegrationServer);
// Don't track changes because the data changes too frequently (authData, isActive, isAuthenticated)
//ChangeTracker.trackChanges(IntegrationServers, 'IntegrationServers');

// These are server side only
IntegrationServers.deny({
  remove () {
    return true;
  },
  insert () {
    return true;
  },
  update () {
    return true;
  }
});

/**
 * Helpers
 */
IntegrationServers.helpers({});