import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Util } from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * ContributorProjectAssignments
 * ============================================================================
 */
export const ContributorProjectAssignment = new SimpleSchema({
  contributorId   : {
    type      : String,
    denyUpdate: true
  },
  teamRoleId: {
    type: String,
    denyUpdate: true
  },
  projectId: {
    type: String
  },
  // Percent dedicated to this team
  percent         : {
    type        : Number,
    defaultValue: 100
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

export const ContributorProjectAssignments = new Mongo.Collection("contributor_project_assignments");
ContributorProjectAssignments.attachSchema(ContributorProjectAssignment);

/**
 * Helpers
 */
ContributorProjectAssignments.helpers({});