import { Mongo }         from 'meteor/mongo';
import SimpleSchema      from 'simpl-schema';
import { ChangeTracker } from 'meteor/austinsand:roba-change-tracker';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * Tasks
 * ============================================================================
 */
export const Task = new SimpleSchema({
  contributorId  : {
    type      : String,
    denyUpdate: true
  },
  title          : {
    type: String
  },
  description    : {
    type    : String,
    optional: true
  },
  state          : {
    type    : SimpleSchema.Integer,
    optional: true
  },
  percentComplete: {
    type        : SimpleSchema.Integer,
    defaultValue: 0
  },
  complete       : {
    type        : Boolean,
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

export const Tasks = new Mongo.Collection('tasks');
Tasks.attachSchema(Task);
ChangeTracker.trackChanges(Tasks, 'Tasks');

// These are server side only
Tasks.deny({
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
Tasks.helpers({});