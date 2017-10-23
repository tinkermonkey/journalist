import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Util } from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';
import { IssueTypes } from './issue_types';

/**
 * ============================================================================
 * ImportedIssues
 * ============================================================================
 */
export const ImportedIssue = new SimpleSchema({
  // The source of this issue
  integrationId: {
    type: String
  },
  // Overall type of this issue:
  issueType: {
    type: Number,
    allowedValues: _.values(IssueTypes)
  },
  // Primary identifier in the originating system
  identifier: {
    type: String
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  // The imported issue document object
  document: {
    type: Object,
    blackbox: true
  },
  // _id of the contributor designated as the owner of this issue
  owner: {
    type: String,
    optional: true
  },
  // Date the issue was created in the originating system
  dateCreated: {
    type: Date,
    optional: true
  },
  // Contributor who created the issue in the originating system
  createdBy: {
    type: String,
    optional: true
  },
  // Date the issue was last modified in the originating system
  dateModified: {
    type: Date,
    optional: true
  },
  // Contributor who last modified the issue in the originating system
  modifiedBy: {
    type: String,
    optional: true
  },
  // Date this issue was last imported from the originating system
  lastImported: {
    type: Date,
    optional: true
  },
  // Date this issue was first imported from the originating system
  firstImported: {
    type: Date,
    optional: true
  }
});

export const ImportedIssues = new Mongo.Collection('imported_issues');
ImportedIssues.attachSchema(ImportedIssue);

// These are server side only
ImportedIssues.deny({
  remove() { return true; },
  insert() { return true; },
  update() { return true; }
});

/**
 * Helpers
 */
ImportedIssues.helpers({});