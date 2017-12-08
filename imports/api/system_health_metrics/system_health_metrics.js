import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 *  Status Metrics - track the health of the system
 */
export const SystemHealthMetric = new SimpleSchema({
  key        : {
    type: String
  },
  title      : {
    type: String
  },
  type      : {
    type: String,
    optional: true
  },
  isHealthy  : {
    type: Boolean,
    defaultValue: false
  },
  detail     : {
    type: Object,
    blackbox: true,
    optional: true
  },
  // Auto track last updated
  lastUpdated: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateModified
  }
});

export const SystemHealthMetrics = new Mongo.Collection('system_health_metrics');
SystemHealthMetrics.attachSchema(SystemHealthMetric);

// These are server side only
SystemHealthMetrics.deny({
  remove() { return true; },
  insert() { return true; },
  update() { return true; }
});

SystemHealthMetrics.helpers({});