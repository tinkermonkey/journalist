import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ChangeTracker } from 'meteor/austinsand:roba-change-tracker';
import { SchemaHelpers } from '../schema_helpers.js';
import { Contributors } from '../contributors/contributors.js';
import { ContributorProjectAssignments } from '../contributors/contributor_project_assignments.js';
import { ContributorRoleDefinitions } from '../contributors/contributor_role_definitions.js';
import { ContributorTeamRoles } from '../contributors/contributor_team_roles.js';

/**
 * ============================================================================
 * Teams
 * ============================================================================
 */
export const Team = new SimpleSchema({
  // Team title
  title       : {
    type: String
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

export const Teams = new Mongo.Collection('teams');
Teams.attachSchema(Team);
ChangeTracker.trackChanges(Teams, 'Teams');

// These are server side only
Teams.deny({
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
Teams.helpers({
  /**
   * Get the list of contributors roles on this team
   * @return {cursor}
   */
  contributorRoles () {
    return ContributorTeamRoles.find({ teamId: this._id }, { sort: { roleId: 1 } })
  },
  /**
   * Get the list of contributors with roles on this team
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  contributors (sortBy) {
    sortBy = sortBy || { name: 1 };
    return Contributors.find({
      _id: {
        $in: this.contributorRoles().map((contributorRole) => {
          return contributorRole.contributorId
        })
      }
    }, { sort: sortBy })
  },
  /**
   * Get the list of contributors with roles on this team
   * @param roleId {Number} The ContributorRole value to limit the list to
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  contributorsInRole (roleId, sortBy) {
    sortBy               = sortBy || { name: 1 };
    let contributorRoles = ContributorTeamRoles.find({ teamId: this._id, roleId: roleId });
    return Contributors.find({
      _id: {
        $in: contributorRoles.map((contributorRole) => {
          return contributorRole.contributorId
        })
      }
    }, { sort: sortBy })
  },
  /**
   * Get all of the distinct role definitions on this team for a given project
   * @param projectId
   */
  rolesInProject (projectId) {
    let team    = this,
        roleIds = [];
    
    // Get the list of team roles for this team and project
    ContributorTeamRoles.find({ teamId: team._id }).forEach((teamRole) => {
      // check for project assignments for the specified project
      if (ContributorProjectAssignments.find({ teamRoleId: teamRole._id, projectId: projectId }).count()) {
        roleIds.push(teamRole.roleId);
      }
    });
    
    // filter for uniqueness
    roleIds = _.uniq(roleIds);
    
    return ContributorRoleDefinitions.find({ _id: { $in: roleIds } }, { sort: { order: 1 } })
  }
});