import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { ContributorRoles } from './contributor_roles';

/**
 * ============================================================================
 * ContributorTeamMembership
 * ============================================================================
 */
export const ContributorTeamMembership = new SimpleSchema({
  contributorId   : {
    type: String
  },
  // An array of the teamIds that this role applies to
  teams           : {
    type: [ String ]
  },
  role            : {
    type         : Number,
    allowedValues: _.keys(ContributorRoles)
  },
  // Percent dedicated to this team
  percent         : {
    type        : Number,
    defaultValue: 100
  },
  // Text description providing a quick summary of the role
  missionStatement: {
    type    : String,
    optional: true
  },
  // Text description providing a list of responsibilities for this role
  responsibilities: {
    type    : [String],
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

export const ContributorTeamMemberships = new Mongo.Collection("contributor_team_memberships");
ContributorTeamMemberships.attachSchema(ContributorTeamMembership);

// These are server side only
ContributorTeamMemberships.deny({
  remove() { return true; },
  insert() { return true; },
  update() { return true; }
});

/**
 * Helpers
 */
ContributorTeamMemberships.helpers({});