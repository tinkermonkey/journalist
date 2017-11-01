import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ChangeTracker } from 'meteor/austinsand:roba-change-tracker';
import { ContributorTeamRoles } from './contributor_team_roles';
import { Projects } from '../projects/projects';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * ContributorProjectAssignments
 * ============================================================================
 */
export const ContributorProjectAssignment = new SimpleSchema({
  contributorId: {
    type      : String,
    denyUpdate: true
  },
  teamRoleId   : {
    type      : String,
    denyUpdate: true
  },
  projectId    : {
    type: String
  },
  // Percent dedicated to this team
  percent      : {
    type        : Number,
    defaultValue: 100,
    min         : 1,
    max         : 100
  },
  // Standard tracking fields
  dateCreated  : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy    : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy   : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const ContributorProjectAssignments = new Mongo.Collection("contributor_project_assignments");
ContributorProjectAssignments.attachSchema(ContributorProjectAssignment);
ChangeTracker.trackChanges(ContributorProjectAssignments, 'ContributorProjectAssignments');

// These are server side only
ContributorProjectAssignments.deny({
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
ContributorProjectAssignments.helpers({
  /**
   * Get the project this assignment is for
   * @return {Project}
   */
  project () {
    return Projects.findOne(this.projectId)
  },
  /**
   * Get the team role this assignment is for
   * @return {ContributorTeamRole}
   */
  teamRole () {
    return ContributorTeamRoles.findOne(this.teamRoleId)
  },
  /**
   * Get the contributor this assignment is for
   * @return {Contributor}
   */
  contributor () {
    return this.teamRole().contributor()
  },
  /**
   * Balance the percent committed across the contributor's assignments
   */
  balanceOtherAssignments () {
    let percentCommitted = this.contributor().percentCommitted(),
        otherAssignments = ContributorProjectAssignments.find({ contributorId: this.contributorId, _id: { $ne: this._id } });
    if (percentCommitted > 100 && otherAssignments.count() && this.percent < (100 - otherAssignments.count())) {
      let overCommitment = otherAssignments.fetch().reduce((sum, assignment) => {
            return sum + assignment.percent
          }, 0),
          reduction      = (100 - this.percent) / overCommitment;
      otherAssignments.forEach((assignment) => {
        ContributorProjectAssignments.update(assignment._id, { $set: { percent: Math.max(Math.floor(reduction * assignment.percent), 1) } });
      });
    }
  }
});