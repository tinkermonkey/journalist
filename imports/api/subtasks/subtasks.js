import { Mongo }             from 'meteor/mongo';
import SimpleSchema          from 'simpl-schema';
import { SchemaHelpers }     from '../schema_helpers.js';
import { CollectionDetails } from '../collection_details';

/**
 * ============================================================================
 * Subtasks
 * ============================================================================
 */
export const Subtask = new SimpleSchema({
  // The contributor assigned to this report
  contributorId   : {
    type: String
  },
  // The name of the collection that the report is for (Tasks, Efforts, etc)
  sourceCollection: {
    type: String
  },
  // The id of the object to which this report belongs
  sourceId        : {
    type: String
  },
  // The title that appears in the list
  title           : {
    type: String
  },
  // The date the report is due
  dueDate         : {
    type    : Date,
    optional: true
  },
  // Whether this is completed
  isCompleted     : {
    type        : Boolean,
    defaultValue: false
  },
  // Date that this was completed
  dateCompleted   : {
    type    : Date,
    optional: true
  },
  // Sort order
  order           : {
    type        : SimpleSchema.Integer,
    defaultValue: 0
  },
  // Standard tracking fields for date only
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

export const Subtasks = new Mongo.Collection("subtasks");
Subtasks.attachSchema(Subtask);

// These are server side only
Subtasks.deny({
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
Subtasks.helpers({
  /**
   * Retrieve the source document
   */
  sourceDocument () {
    let subtask = this,
        details = CollectionDetails[ subtask.sourceCollection ];
    if (details) {
      return details.collection.findOne(subtask.sourceId);
    } else {
      console.error('Subtasks.sourceDocument failed to find collection:', subtask.sourceCollection)
    }
  }
});