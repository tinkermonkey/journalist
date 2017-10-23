import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ChangeTracker } from 'meteor/austinsand:roba-change-tracker';
import { SchemaHelpers } from '../schema_helpers.js';
import { ContributorTeamRoles } from './contributor_team_roles';
import { Efforts } from '../efforts/efforts';
import { Priorities } from '../priorities/priorities';
import { Projects } from '../projects/projects';
import { Tasks } from '../tasks/tasks';
import { Teams } from '../teams/teams';
import { Users } from '../users/users.js';
import { UserTypes } from '../users/user_types.js';

/**
 * ============================================================================
 * Contributors
 * ============================================================================
 */
export const Contributor = new SimpleSchema({
  // Primary identifier for this contributor, typically email address
  identifier      : {
    type: String
  },
  email           : {
    type : String,
    regEx: SimpleSchema.RegEx.Email
  },
  name            : {
    type    : String,
    optional: true
  },
  // _id of the Contributor who manages this contributor
  manager         : {
    type    : String,
    optional: true
  },
  // The link to the user record for this contributor
  userId          : {
    type    : String,
    optional: true
  },
  // The user level from the user record for this contributor
  usertype        : {
    type         : Number,
    defaultValue : UserTypes.contributor,
    allowedValues: _.values(UserTypes)
  },
  // Mission statement for this contributor
  missionStatement: {
    type    : String,
    optional: true
  },
  // Standard tracking fields minus createdBy and modifiedBy because these are typically created by pulling data from the issue tracker
  dateCreated     : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  dateModified    : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  }
});

export const Contributors = new Mongo.Collection('contributors');
Contributors.attachSchema(Contributor);
ChangeTracker.trackChanges(Contributors, 'Contributors');

// These are server side only
Contributors.deny({
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
Contributors.helpers({
  /**
   * Is this contributor an administrator?
   * @return {boolean}
   */
  isAdmin(){
    return this.usertype === UserTypes.administrator
  },
  /**
   * Is this contributor a manager
   * @return {boolean}
   */
  isManager(){
    return this.usertype === UserTypes.administrator || this.usertype === UserTypes.manager
  },
  /**
   * Fetch the user record for this contributor
   * @return {cursor}
   */
  user(){
    if (this.userId) {
      return Users.findOne({ _id: this.userId })
    }
  },
  /**
   * Get all of the team roles for this contributor
   * @return {cursor}
   */
  teamRoles(){
    return ContributorTeamRoles.find({ contributorId: this._id });
  },
  /**
   * Determine if this user serves the same role on all teams
   * @return {boolean}
   */
  hasSameRole(){
    return _.uniq(this.teamRoles().map((role) => {
          return role.role
        })).length < 2
  },
  /**
   * Get the list of teams that this contributor participates in
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  participatingTeams(sortBy){
    let contributor = this,
        teamIds     = [];
    
    // Default sort
    sortBy = sortBy || { title: 1 };
    
    // Find all of the teams that this user has a role on
    ContributorTeamRoles.find({ contributorId: contributor._id }).forEach((role) => {
      teamIds.push(role.teamId);
    });
    
    return Teams.find({ _id: { $in: teamIds } }, { sort: sortBy })
  },
  /**
   * Get all of the projects for which this contributor doesn't have a role
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  otherTeams(sortBy){
    let contributor = this;
    
    // Default sort
    sortBy = sortBy || { title: 1 };
    
    return Teams.find({
      _id: {
        $nin: contributor.participatingTeams().map((team) => {
          return team._id
        })
      }
    });
  },
  /**
   * Get the list of direct reports for this contributor
   * @return {cursor}
   */
  directReports(){
    let contributor = this;
    return Contributors.find({ manager: contributor._id, _id: { $ne: contributor._id } })
  },
  /**
   * Get the list of indirect reports for this contributor
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  indirectReports(sortBy){
    let contributor = this,
        reportIds   = [];
    
    // Default sort
    sortBy = sortBy || { name: 1 };
    
    // Get all of the direct reports and their reports
    contributor.directReports().forEach((report) => {
      report.allReports().forEach((report) => {
        reportIds.push(report._id);
      });
    });
    
    // Get all of the contributor records
    return Contributors.find({ _id: { $in: reportIds } }, { sort: sortBy });
  },
  /**
   * Get the list of contributorIds that this contributor manages
   * @return {cursor}
   */
  allReportIds(){
    let contributor = this,
        reportIds   = [];
    
    // Get all of the direct reports and their reports
    contributor.directReports().forEach((report) => {
      reportIds.push(report._id);
      report.allReports().forEach((report) => {
        reportIds.push(report._id);
      });
    });
    
    return reportIds
  },
  /**
   * Get the list of all reports for this contributor
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  allReports(sortBy){
    // Default sort
    sortBy = sortBy || { name: 1 };
    
    // Return the cursor to all of the contributor records
    return Contributors.find({ _id: { $in: this.allReportIds() } }, { sort: sortBy });
  },
  /**
   * Get projects that have a direct role for this contributor
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  participatingProjects(sortBy){
    let contributor = this,
        projectIds  = [];
    
    // Default sort
    sortBy = sortBy || { title: 1 };
    
    // Get any projects where this user is the owner
    Projects.find({ owner: contributor._id }).forEach((project) => {
      projectIds.push(project);
    });
    
    // Get any projects where this user has a role
    contributor.participatingTeams().forEach((team) => {
      projectIds.push(team.projectId)
    });
    
    return Projects.find({ _id: { $in: projectIds } }, { sort: sortBy })
  },
  /**
   * Get all of the projects for which this contributor doesn't have a role
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  otherProjects(sortBy){
    let contributor = this;
    
    // Default sort
    sortBy = sortBy || { title: 1 };
    
    return Projects.find({
      _id: {
        $nin: contributor.participatingProjects().map((project) => {
          return project._id
        })
      }
    });
  },
  /**
   * Determine if this contributor manages a specific contributor
   * @param contributorId
   * @return {boolean}
   */
  managesContributor(contributorId){
    try {
      let managerReportIds = this.allReports().map((report) => {
        return report._id
      });
      
      return _.contains(managerReportIds, contributorId);
    } catch (e) {
      console.error('User.managesContributor failed:', e);
      return false
    }
  },
  /**
   * Get all of the Efforts for this contributor
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  efforts(sortBy){
    sortBy = sortBy || { title: 1 };
    return Efforts.find({ contributorId: this._id }, { sort: sortBy })
  },
  /**
   * Get all of the Priorities for this contributor
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  priorities(sortBy){
    sortBy = sortBy || { order: 1 };
    return Priorities.find({ contributorId: this._id }, { sort: sortBy })
  },
  /**
   * Get all of the Tasks for this contributor
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  tasks(sortBy){
    sortBy = sortBy || { title: 1 };
    return Tasks.find({ contributorId: this._id }, { sort: sortBy })
  }
});