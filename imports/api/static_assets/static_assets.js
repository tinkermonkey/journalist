import { Mongo }         from 'meteor/mongo';
import SimpleSchema      from 'simpl-schema';
import { SchemaHelpers } from '../schema_helpers';

/**
 * ============================================================================
 * StaticAssets
 * ============================================================================
 */
export const StaticAsset = new SimpleSchema({
  key         : {
    type: String
  },
  type        : {
    type    : String,
    optional: true
  },
  data        : {
    type: String
  },
  size: {
    type: SimpleSchema.Integer
  },
  stats       : {
    type    : Object,
    blackbox: true,
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

export const StaticAssets = new Mongo.Collection("static_assets");
StaticAssets.attachSchema(StaticAsset);

// These are server side only
StaticAssets.deny({
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
StaticAssets.helpers({});