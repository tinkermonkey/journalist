import { Mongo }         from 'meteor/mongo';
import SimpleSchema      from 'simpl-schema';
import { Util }          from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';
import { Releases }      from '../releases/releases';

/**
 * ============================================================================
 * Jobs
 * ============================================================================
 */
export const ScheduledJob = new SimpleSchema({
  title       : {
    type: String
  },
  preambleCode: {
    type    : String,
    optional: true
  },
  jobCode     : {
    type    : String,
    optional: true
  },
  // Standard tracking fields
  dateCreated : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy   : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified: {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy  : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const ScheduledJobs = new Mongo.Collection("scheduled_jobs");
ScheduledJobs.attachSchema(ScheduledJob);
ChangeTracker.trackChanges(ScheduledJobs, 'ScheduledJobs');

// These are server side only
ScheduledJobs.deny({
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
ScheduledJobs.helpers({});