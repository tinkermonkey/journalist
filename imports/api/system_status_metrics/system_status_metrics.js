import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 *  Status Metrics - track the health of the system
 */
export const SystemStatusMetric = new SimpleSchema({
  key: {
    type: String
  },
  title: {
    type: String
  },
  healthy: {
    type: Boolean,
    defaultValue: false
  },
  detail: {
    type: Object,
    blackbox: true,
    optional: true
  },
  lastUpdated: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateModified
  }
});

export const SystemStatusMetrics = new Mongo.Collection('system_status_metrics');
SystemStatusMetrics.attachSchema(SystemStatusMetric);

// These are server side only
SystemStatusMetrics.deny({
  remove() { return true; },
  insert() { return true; },
  update() { return true; }
});

SystemStatusMetrics.helpers({});