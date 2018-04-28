import { Mongo }         from 'meteor/mongo';
import SimpleSchema      from 'simpl-schema';
import { SchemaHelpers } from '../schema_helpers';

/**
 * ============================================================================
 * DynamicCollections
 * ============================================================================
 */
export const DynamicCollection = new SimpleSchema({
  title           : {
    type: String
  },
  preambleCode    : {
    type    : String,
    optional: true
  },
  schemaCode      : {
    type    : String,
    optional: true
  },
  helpersCode     : {
    type    : String,
    optional: true
  },
  methodsCode     : {
    type    : String,
    optional: true
  },
  publicationsCode: {
    type    : String,
    optional: true
  },
  upgradeCode     : {
    type    : String,
    optional: true
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

export const DynamicCollections = new Mongo.Collection("dynamic_collections");
DynamicCollections.attachSchema(DynamicCollection);
ChangeTracker.trackChanges(DynamicCollections, 'DynamicCollections');

// These are server side only
DynamicCollections.deny({
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
DynamicCollections.helpers({});