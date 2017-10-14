import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Util } from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';
import { IssueTypes } from '../imported_issues/issue_types';

/**
 * ============================================================================
 * Integrations
 * ============================================================================
 */
export const Integration = new SimpleSchema({
  // Project to which this integration belongs
  projectId: {
    type: String
  },
  // Overall type of this issue:
  issueType: {
    type: Number,
    allowedValues: _.keys(IssueTypes)
  },
  // Configuration blob
  config: {
    type: Object,
    blackbox: true
  },
  // Standard tracking fields
  dateCreated: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  },
});

export const Integrations = new Mongo.Collection("integrations");
Integrations.attachSchema(Integration);

/**
 * Helpers
 */
Integrations.helpers({});