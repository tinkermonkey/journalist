import { Mongo }         from 'meteor/mongo';
import SimpleSchema      from 'simpl-schema';
import { Util }          from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * Releases
 * ============================================================================
 */
export const Release = new SimpleSchema({
  title              : {
    type: String
  },
  versionNumber      : {
    type    : String,
    optional: true
  },
  externalReleaseDate: {
    type    : String,
    optional: true
  },
  internalReleaseDate: {
    type    : Date,
    optional: true
  },
  isReleased         : {
    type        : Boolean,
    defaultValue: false
  },
  bannerTemplate     : {
    type    : String,
    optional: true
  },
  homeTemplate       : {
    type    : String,
    optional: true
  },
  // Reports to show for this team
  reports            : {
    type    : Array, // String
    optional: true
  },
  'reports.$'        : {
    type: String
  },
  // Standard tracking fields
  dateCreated        : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy          : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified       : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy         : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const Releases = new Mongo.Collection("releases");
Releases.attachSchema(Release);

/**
 * Helpers
 */
Releases.helpers({});