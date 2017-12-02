import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Util } from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * IntegrationServerCaches
 * ============================================================================
 */
export const IntegrationServerCache = new SimpleSchema({
  // The _id of the IntegrationServer from which this data came
  serverId: {
    type: String
  },
  key: {
    type: String
  },
  value: {
    type: Object,
    blackbox: true
  },
  // Track the age of the data
  timestamp: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateModified
  }
});

export const IntegrationServerCaches = new Mongo.Collection("integration_server_caches");
IntegrationServerCaches.attachSchema(IntegrationServerCache);

// These are server side only
IntegrationServerCaches.deny({
  remove() { return true; },
  insert() { return true; },
  update() { return true; }
});

/**
 * Helpers
 */
IntegrationServerCaches.helpers({});