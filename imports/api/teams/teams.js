import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ChangeTracker } from 'meteor/austinsand:roba-change-tracker';
import { SchemaHelpers } from '../schema_helpers.js';
import { Contributors } from '../contributors/contributors.js';
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
  remove() {
    return true;
  },
  insert() {
    return true;
  },
  update() {
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
  roles(){
    return ContributorTeamRoles.find({ teamId: this._id }, { sort: { role: 1 } })
  },
  /**
   * Get the list of contributors with roles on this team
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  contributors(sortBy){
    sortBy = sortBy || { name: 1 };
    return Contributors.find({
      _id: {
        $in: this.roles().map((role) => {
          return role.contributorId
        })
      }
    }, { sort: sortBy })
  },
  /**
   * Get the list of contributors with roles on this team
   * @param role {Number} The ContributorRole value to limit the list to
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  contributorsInRole(role, sortBy){
    sortBy = sortBy || { name: 1 };
    let roles = ContributorTeamRoles.find({ teamId: this._id, role: role });
    return Contributors.find({
      _id: {
        $in: roles.map((role) => {
          return role.contributorId
        })
      }
    }, { sort: sortBy })
  }
});