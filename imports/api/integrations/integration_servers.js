import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Util } from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';
import { IntegrationTypes } from './integration_types';

/**
 * ============================================================================
 * IntegrationServers
 * ============================================================================
 */
export const IntegrationServer = new SimpleSchema({
  title: {
    type: String
  },
  integrationType: {
    type: Number,
    allowedValues: _.values(IntegrationTypes)
  },
  baseUrl: {
    type: String
  },
  // Standard tracking fields
  dateCreated: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const IntegrationServers = new Mongo.Collection("integration_servers");
IntegrationServers.attachSchema(IntegrationServer);
ChangeTracker.trackChanges(IntegrationServers, 'IntegrationServers');

// These are server side only
IntegrationServers.deny({
  remove() { return true; },
  insert() { return true; },
  update() { return true; }
});

/**
 * Helpers
 */
IntegrationServers.helpers({

});