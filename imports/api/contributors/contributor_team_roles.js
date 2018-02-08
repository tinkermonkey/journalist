import { Mongo }                         from 'meteor/mongo';
import SimpleSchema                      from 'simpl-schema';
import { ChangeTracker }                 from 'meteor/austinsand:roba-change-tracker';
import { SchemaHelpers }                 from '../schema_helpers.js';
import { Contributors }                  from './contributors';
import { ContributorProjectAssignments } from './contributor_project_assignments';
import { ContributorRoleDefinitions }    from './contributor_role_definitions';
import { Teams }                         from '../teams/teams';

/**
 * ============================================================================
 * ContributorTeamRole
 * ============================================================================
 */
export const ContributorTeamRole = new SimpleSchema({
  contributorId   : {
    type      : String,
    denyUpdate: true
  },
  // The teamId that this role applies to
  teamId          : {
    type: String
  },
  // Link to the role definition
  roleId          : {
    type: String
  },
  // Text description providing a quick summary of the role
  missionStatement: {
    type    : String,
    optional: true
  },
  // Text description providing a list of responsibilities for this role
  responsibilities: {
    type    : Array, // String
    optional: true
  },
  'responsibilities.$': {
    type: String
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

export const ContributorTeamRoles = new Mongo.Collection('contributor_team_roles');
ContributorTeamRoles.attachSchema(ContributorTeamRole);
ChangeTracker.trackChanges(ContributorTeamRoles, 'ContributorTeamRoles');

// These are server side only
ContributorTeamRoles.deny({
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
ContributorTeamRoles.helpers({
  /**
   * Get the team record for this role
   */
  team () {
    return Teams.findOne({ _id: this.teamId })
  },
  /**
   * Get all of the project assignments for a role
   */
  projectAssignments (projectId) {
    let query = { teamRoleId: this._id };
    if (_.isString(projectId)) {
      query.projectId = projectId
    }
    
    return ContributorProjectAssignments.find(query, { sort: { percent: -1 } })
  },
  /**
   * Get the contributor this team role is for
   * @return {Contributor}
   */
  contributor () {
    return Contributors.findOne(this.contributorId)
  },
  /**
   * Fetch the role definition
   * @return {ContributorRoleDefinition}
   */
  roleDefinition () {
    return ContributorRoleDefinitions.findOne(this.roleId)
  }
});