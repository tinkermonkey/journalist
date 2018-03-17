import { Mongo }                         from 'meteor/mongo';
import SimpleSchema                      from 'simpl-schema';
import { logger }                        from 'meteor/austinsand:journalist-logger';
import { ChangeTracker }                 from 'meteor/austinsand:roba-change-tracker';
import { SchemaHelpers }                 from '../schema_helpers.js';
import { ContributorTeamRoles }          from './contributor_team_roles';
import { ContributorProjectAssignments } from './contributor_project_assignments';
import { Efforts }                       from '../efforts/efforts';
import { Priorities }                    from '../priorities/priorities';
import { Projects }                      from '../projects/projects';
import { Tasks }                         from '../tasks/tasks';
import { Teams }                         from '../teams/teams';
import { Users }                         from '../users/users.js';
import { UserTypes }                     from '../users/user_types.js';
import { ContributorRoleDefinitions }    from './contributor_role_definitions';

/**
 * ============================================================================
 * Contributors
 * ============================================================================
 */
export const Contributor = new SimpleSchema({
  email           : {
    type : String,
    regEx: SimpleSchema.RegEx.Email
  },
  name            : {
    type    : String,
    optional: true
  },
  // Set of identifiers used by various integrations to denote this contributor
  identifiers     : {
    type    : Array, // String
    optional: true
  },
  'identifiers.$' : {
    type: String
  },
  // Hashmap of profiles from the various integration servers, keyed by the server _id
  profiles        : {
    type    : Object,
    blackbox: true,
    optional: true
  },
  isActive        : {
    type        : Boolean,
    defaultValue: true
  },
  // _id of the Contributor who manages this contributor
  managerId       : {
    type    : String,
    optional: true
  },
  // The link to the user record for this contributor
  userId          : {
    type    : String,
    optional: true
  },
  // The default role for this contributor
  roleId          : {
    type    : String,
    optional: true
  },
  // The user level from the user record for this contributor
  usertype        : {
    type         : SimpleSchema.Integer,
    defaultValue : UserTypes.contributor,
    allowedValues: _.values(UserTypes)
  },
  // Mission statement for this contributor
  missionStatement: {
    type    : String,
    optional: true
  },
  // Standard tracking fields minus createdBy and modifiedBy because these are typically created by pulling data from the item tracker
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
Contributors.helpers({
  /**
   * Is this contributor an administrator?
   * @return {boolean}
   */
  isAdmin () {
    return this.usertype === UserTypes.administrator
  },
  /**
   * Is this contributor a manager
   * @return {boolean}
   */
  isManager () {
    return this.usertype === UserTypes.administrator || this.usertype === UserTypes.manager
  },
  /**
   * Fetch the user record for this contributor
   * @return {cursor}
   */
  user () {
    if (this.userId) {
      return Users.findOne({ _id: this.userId })
    }
  },
  /**
   * Get all of the team roles for this contributor
   * @return {cursor}
   */
  teamRoles () {
    return ContributorTeamRoles.find({ contributorId: this._id });
  },
  /**
   * Determine if this user serves the same role on all teams
   * @return {boolean}
   */
  hasSameRole () {
    return _.uniq(this.teamRoles().map((teamRole) => {
      return teamRole.roleId
    })).length < 2
  },
  /**
   * Get the roles for this contributor on a specific team
   */
  rolesOnTeam (teamId) {
    logger.info('rolesOnTeam:', this._id, this.name, teamId, ContributorTeamRoles.find({ contributorId: this._id, teamId: teamId })
        .count());
    return ContributorTeamRoles.find({ contributorId: this._id, teamId: teamId });
  },
  /**
   * Get the list of teams that this contributor participates in
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  participatingTeams (sortBy) {
    let contributor = this,
        teamIds     = [];
    
    // Default sort
    sortBy = sortBy || { title: 1 };
    
    // Find all of the teams that this user has a role on
    ContributorTeamRoles.find({ contributorId: { $in: contributor.allStaffIds() } }).forEach((teamRole) => {
      teamIds.push(teamRole.teamId);
    });
    
    // Filter for the unique keys
    teamIds = _.uniq(teamIds);
    
    return Teams.find({ _id: { $in: teamIds } }, { sort: sortBy })
  },
  /**
   * Get all of the projects for which this contributor doesn't have a role
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  otherTeams (sortBy) {
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
   * Determine if this contributor manages a given team
   * @param teamId {String}
   * @return {cursor}
   */
  managesTeam (teamId) {
    let contributor               = this,
        contributorManagesManager = false;
    
    // Get the list of managers for the team that this contributor manages
    ContributorTeamRoles.find({ teamId: teamId, contributorId: { $in: contributor.allStaffIds() } }).forEach((teamRole) => {
      contributorManagesManager = contributorManagesManager || teamRole.roleDefinition().isManager
    });
    
    return contributorManagesManager
  },
  /**
   * Get the list of direct staff for this contributor
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  directStaff (sortBy) {
    let contributor = this;
    
    // Default sort
    sortBy = sortBy || { name: 1 };
    
    return Contributors.find({ managerId: contributor._id, _id: { $ne: contributor._id } }, { sort: sortBy })
  },
  /**
   * Get the list of indirect staff for this contributor
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  indirectStaff (sortBy) {
    let contributor = this,
        staffIds    = [];
    
    // Default sort
    sortBy = sortBy || { name: 1 };
    
    // Get all of the direct staff and their staff
    contributor.directStaff().forEach((staff) => {
      staff.allStaff().forEach((staff) => {
        staffIds.push(staff._id);
      });
    });
    
    // Get all of the contributor records
    return Contributors.find({ _id: { $in: staffIds } }, { sort: sortBy });
  },
  /**
   * Get the list of contributorIds that this contributor manages
   * @return {cursor}
   */
  allStaffIds () {
    let contributor = this,
        staffIds    = [];
    
    // Get all of the direct staff and their staff
    contributor.directStaff().forEach((staff) => {
      staffIds.push(staff._id);
      staff.allStaff().forEach((staff) => {
        staffIds.push(staff._id);
      });
    });
    
    return staffIds
  },
  /**
   * Get the list of all staff for this contributor
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  allStaff (sortBy) {
    // Default sort
    sortBy = sortBy || { name: 1 };
    
    // Return the cursor to all of the contributor records
    return Contributors.find({ _id: { $in: this.allStaffIds() } }, { sort: sortBy });
  },
  /**
   * Get projects that have a direct role for this contributor
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  participatingProjects (sortBy) {
    let contributor = this,
        projectIds  = [];
    
    // Default sort
    sortBy = sortBy || { title: 1 };
    
    // Get any projects where this user is the owner
    Projects.find({ owner: contributor._id }).forEach((project) => {
      projectIds.push(project._id);
    });
    
    // Get any projects where this user has a role
    contributor.participatingTeams().forEach((team) => {
      if (team.projectId) {
        projectIds.push(team.projectId)
      }
    });
    
    // Filter for the unique keys
    projectIds = _.uniq(projectIds);
    //logger.info('participatingProjects:', Meteor.user().contributor()._id, contributor._id, projectIds);
    
    return Projects.find({ _id: { $in: projectIds } }, { sort: sortBy })
  },
  /**
   * Get all of the projects for which this contributor doesn't have a role
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  otherProjects (sortBy) {
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
  managesContributor (contributorId) {
    try {
      let managesStaffIds = this.allStaff().map((staff) => {
        return staff._id
      });
      
      return _.contains(managesStaffIds, contributorId);
    } catch (e) {
      logger.error('User.managesContributor failed:', e);
      return false
    }
  },
  /**
   * Calculate the sum of this contributor's commitments
   */
  percentCommitted () {
    return ContributorProjectAssignments.find({ contributorId: this._id }).fetch().reduce((sum, assignment) => {
      return sum + assignment.percent
    }, 0);
  },
  /**
   * Determine if this contributor has capacity for more roles
   */
  hasCapacity () {
    return this.percentCommitted() < 100
  },
  /**
   * Get the project assignments for a team role
   * @param teamId
   * @param roleId
   * @param projectId
   */
  assignmentsForRole (teamId, roleId, projectId) {
    let teamRole = ContributorTeamRoles.findOne({ contributorId: this._id, teamId: teamId, roleId: roleId });
    if (teamRole) {
      return teamRole.projectAssignments(projectId);
    }
  },
  /**
   * Get all of the Efforts for this contributor
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  efforts (sortBy) {
    // Default sort, check for sortBy.hash because that is what is passed in by Spacebars if sortBy is not passed
    sortBy = _.isObject(sortBy) && sortBy.hash === null ? sortBy : { title: 1 };
    return Efforts.find({ contributorId: this._id, complete: false }, { sort: sortBy })
  },
  /**
   * Get all of the Priorities for this contributor
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  priorities (sortBy) {
    // Default sort, check for sortBy.hash because that is what is passed in by Spacebars if sortBy is not passed
    sortBy = _.isObject(sortBy) && sortBy.hash === null ? sortBy : { order: 1 };
    return Priorities.find({ contributorId: this._id }, { sort: sortBy })
  },
  /**
   * Get all of the Tasks for this contributor
   * @param sortBy {Object} Mongo sort directive
   * @return {cursor}
   */
  tasks (sortBy) {
    // Default sort, check for sortBy.hash because that is what is passed in by Spacebars if sortBy is not passed
    sortBy = _.isObject(sortBy) && sortBy.hash === null ? sortBy : { title: 1 };
    return Tasks.find({ contributorId: this._id, complete: false }, { sort: sortBy })
  },
  /**
   * Get the role definition for the default role for this contributor
   */
  defaultRole () {
    if (this.roleId) {
      return ContributorRoleDefinitions.findOne(this.roleId)
    }
  }
});