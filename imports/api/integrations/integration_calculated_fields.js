import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ChangeTracker } from 'meteor/austinsand:roba-change-tracker';
import { Util } from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * IntegrationCalculatedFields
 * ============================================================================
 */
export const IntegrationCalculatedField = new SimpleSchema({
  title: {
    type: String
  },
  description: {
    type: String,
    optional: true
  },
  code: {
    type: String,
    optional: true
  },
  // Standard tracking fields
  dateCreated      : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy        : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified     : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy       : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const IntegrationCalculatedFields = new Mongo.Collection("integration_calculated_fields");
IntegrationCalculatedFields.attachSchema(IntegrationCalculatedField);
ChangeTracker.trackChanges(IntegrationCalculatedFields, 'IntegrationCalculatedFields');

// These are server side only
IntegrationCalculatedFields.deny({
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
IntegrationCalculatedFields.helpers({});