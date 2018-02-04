import { Mongo }         from 'meteor/mongo';
import SimpleSchema      from 'simpl-schema';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * TaskStates
 * ============================================================================
 */
export const TaskState = new SimpleSchema({
  title       : {
    type: String
  },
  order       : {
    type: Number
  },
  color       : {
    type         : String,
    allowedValues: _.keys(StatusReportStates),
    defaultValue : _.keys(StatusReportStates)[ 0 ]
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

export const TaskStates = new Mongo.Collection('task_states');
TaskStates.attachSchema(TaskState);

// These are server side only
TaskStates.deny({
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
TaskStates.helpers({});