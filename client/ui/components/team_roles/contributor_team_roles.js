import './contributor_team_roles.html';
import { Template } from 'meteor/templating';
import './editable_contributor_roles.js';

/**
 * Template Helpers
 */
Template.ContributorTeamRoles.helpers({
  firstRole(){
    let roles = this.teamRoles().fetch();
    console.log('firstRole:', roles);
    return roles.length ? roles[0] : null
  }
});

/**
 * Template Event Handlers
 */
Template.ContributorTeamRoles.events({});

/**
 * Template Created
 */
Template.ContributorTeamRoles.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ContributorTeamRoles.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ContributorTeamRoles.onDestroyed(() => {
  
});
