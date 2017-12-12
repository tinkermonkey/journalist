import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ChangeTracker } from 'meteor/austinsand:roba-change-tracker';
import { SchemaHelpers } from '../schema_helpers.js';
import { IntegrationTypes } from './integration_types';
import { ItemTypes } from '../imported_items/item_types';

/**
 * ============================================================================
 * IntegrationImportFunctions
 * ============================================================================
 */
export const IntegrationImportFunction = new SimpleSchema({
  title          : {
    type: String
  },
  integrationType: {
    type         : Number,
    allowedValues: _.values(IntegrationTypes)
  },
  itemType      : {
    type         : Number,
    allowedValues: _.values(ItemTypes)
  },
  description    : {
    type    : String,
    optional: true
  },
  code           : {
    type    : String,
    optional: true
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

export const IntegrationImportFunctions = new Mongo.Collection("integration_import_functions");
IntegrationImportFunctions.attachSchema(IntegrationImportFunction);
ChangeTracker.trackChanges(IntegrationImportFunctions, 'IntegrationImportFunctions');

// These are server side only
IntegrationImportFunctions.deny({
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
IntegrationImportFunctions.helpers({});