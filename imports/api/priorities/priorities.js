import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ChangeTracker } from 'meteor/austinsand:roba-change-tracker';
import { Util } from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * Priorities
 * ============================================================================
 */
export const Priority = new SimpleSchema({
  contributorId: {
    type: String,
    denyUpdate: true
  },
  title: {
    type: String
  },
  order: {
    type: Number
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

export const Priorities = new Mongo.Collection('priorities');
Priorities.attachSchema(Priority);
ChangeTracker.trackChanges(Priorities, 'Priorities');

// These are server side only
Priorities.deny({
  remove() { return true; },
  insert() { return true; },
  update() { return true; }
});

/**
 * Helpers
 */
Priorities.helpers({});