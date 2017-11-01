import './team_role_contributor_list.html';
import { Template } from 'meteor/templating';
import { Teams } from '../../../../imports/api/teams/teams';

/**
 * Template Helpers
 */
Template.TeamRoleContributorList.helpers({
  contributorsInRole(teamId, role){
    return Teams.findOne(teamId).contributorsInRole(role)
  }
});

/**
 * Template Event Handlers
 */
Template.TeamRoleContributorList.events({});

/**
 * Template Created
 */
Template.TeamRoleContributorList.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.TeamRoleContributorList.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TeamRoleContributorList.onDestroyed(() => {
  
});
