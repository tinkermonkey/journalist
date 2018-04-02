import { Mongo }                         from 'meteor/mongo';
import SimpleSchema                      from 'simpl-schema';
import { ChangeTracker }                 from 'meteor/austinsand:roba-change-tracker';
import { SchemaHelpers }                 from '../schema_helpers.js';
import { Contributors }                  from '../contributors/contributors';
import { ContributorProjectAssignments } from '../contributors/contributor_project_assignments';
import { ContributorTeamRoles }          from '../contributors/contributor_team_roles';
import { Integrations }                  from '../integrations/integrations';
import { Teams }                         from '../teams/teams';

/**
 * ============================================================================
 * Projects
 * ============================================================================
 */
export const Project = new SimpleSchema({
  // Project Title
  title              : {
    type: String
  },
  // Project Description
  description        : {
    type    : String,
    optional: true
  },
  // Banner Template
  bannerTemplate     : {
    type    : String,
    optional: true
  },
  // Home page template
  homeTemplate       : {
    type    : String,
    optional: true
  },
  reports            : {
    type    : Array, // String
    optional: true
  },
  'reports.$'        : {
    type: String
  },
  integrationProjects: {
    type    : Object,
    blackbox: true,
    optional: true
  },
  // Contributor that is the primary owner of this project
  owner              : {
    type    : String,
    optional: true
  },
  // Standard tracking fields
  dateCreated        : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy          : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified       : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy         : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const Projects = new Mongo.Collection('projects');
Projects.attachSchema(Project);
ChangeTracker.trackChanges(Projects, 'Projects');

// These are server side only
Projects.deny({
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
Projects.helpers({
  /**
   * Fetch the list of ContributorTeamRoles for this project
   * @param query
   * @return {Array}
   */
  teamRoleIds (query) {
    let project     = this,
        teamRoleIds = [];
    
    // built up the query
    query           = query || {};
    query.projectId = project._id;
    
    // Gather all of the teamIds from assignments to this team
    ContributorProjectAssignments.find(query).forEach((assignment) => {
      teamRoleIds.push(assignment.teamRoleId);
    });
    
    // Filter for uniqueness
    return _.uniq(teamRoleIds);
  },
  /**
   * Fetch a list of teams that work on this project
   * @param sortBy
   * @return {cursor}
   */
  teams (sortBy) {
    let project = this,
        teamIds = [];
    
    // Default sort, check for sortBy.hash because that is what is passed in by Spacebars if sortBy is not passed
    sortBy = _.isObject(sortBy) && sortBy.hash === null ? sortBy : { title: 1 };
    
    // Gather all of the teamIds from assignments to this team
    ContributorTeamRoles.find({ _id: { $in: project.teamRoleIds() } }).forEach((teamRole) => {
      teamIds.push(teamRole.teamId);
    });
    
    // Filter for uniqueness
    teamIds = _.uniq(teamIds);
    
    return Teams.find({ _id: { $in: teamIds } }, { sort: sortBy })
  },
  /**
   * Get all of the contributors in a given role on a given team for this project
   * @param roleId
   * @param teamId
   * @param sortBy
   */
  contributorsInRoleOnTeam (roleId, teamId, sortBy) {
    let project        = this,
        contributorIds = [];
    
    // Default sort, check for sortBy.hash because that is what is passed in by Spacebars if sortBy is not passed
    sortBy = _.isObject(sortBy) && sortBy.hash === null ? sortBy : { name: 1 };
    
    // Gather all of the teamIds from assignments to this team
    ContributorTeamRoles.find({ _id: { $in: project.teamRoleIds() }, roleId: roleId, teamId: teamId }).forEach((teamRole) => {
      contributorIds.push(teamRole.contributorId);
    });
    
    // Filter for uniqueness
    contributorIds = _.uniq(contributorIds);
    
    return Contributors.find({ _id: { $in: contributorIds } }, { sort: sortBy })
  },
  
  /**
   * Get all of the integrations for this project
   */
  integrations () {
    return Integrations.find({ projectId: this._id }, { sort: { itemType: 1, integrationType: 1 } })
  }
});