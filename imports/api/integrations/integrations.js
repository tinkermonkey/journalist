import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ChangeTracker } from 'meteor/austinsand:roba-change-tracker';
import { Util } from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';
import { IssueTypes } from '../imported_issues/issue_types';
import { IntegrationTypes } from './integration_types';
import { Projects } from '../projects/projects';

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
  integrationType: {
    type: Number,
    allowedValues: _.values(IntegrationTypes)
  },
  // Overall type of this issue:
  issueType: {
    type: Number,
    allowedValues: _.values(IssueTypes)
  },
  // Configuration blob
  details: {
    type: Object,
    blackbox: true,
    optional: true
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
  }
});

export const Integrations = new Mongo.Collection('integrations');
Integrations.attachSchema(Integration);
ChangeTracker.trackChanges(Integrations, 'Integrations');

// These are server side only
Integrations.deny({
  remove() { return true; },
  insert() { return true; },
  update() { return true; }
});

/**
 * Helpers
 */
Integrations.helpers({
  integrationTypeTitle(){
    return Util.camelToTitle(_.invert(IntegrationTypes)[this.integrationType])
  },
  issueTypeTitle(){
    return Util.camelToTitle(_.invert(IssueTypes)[this.issueType])
  },
  project(){
    return Projects.findOne({_id: this.projectId})
  }
});