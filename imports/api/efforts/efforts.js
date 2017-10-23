import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ChangeTracker } from 'meteor/austinsand:roba-change-tracker';
import { Util } from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * Efforts
 * ============================================================================
 */
export const Effort = new SimpleSchema({
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

export const Efforts = new Mongo.Collection("efforts");
Efforts.attachSchema(Effort);
ChangeTracker.trackChanges(Efforts, 'Efforts');

/**
 * Helpers
 */
Efforts.helpers({});