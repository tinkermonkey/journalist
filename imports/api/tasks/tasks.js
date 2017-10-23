import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ChangeTracker } from 'meteor/austinsand:roba-change-tracker';
import { Util } from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * Tasks
 * ============================================================================
 */
export const Task = new SimpleSchema({
  contributorId: {
    type: String,
    denyUpdate: true
  },
  title: {
    type: String
  },
  // Standard tracking fields
  dateCreated     : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy       : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified    : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy      : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const Tasks = new Mongo.Collection("tasks");
Tasks.attachSchema(Task);
ChangeTracker.trackChanges(Tasks, 'Tasks');

/**
 * Helpers
 */
Tasks.helpers({});