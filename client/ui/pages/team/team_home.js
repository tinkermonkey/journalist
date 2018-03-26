import './team_home.html';
import { Template } from 'meteor/templating';
import { Teams }    from '../../../../imports/api/teams/teams';
import './team_banner.js';
import './team_roster.js';
import './team_sidebar.js';

/**
 * Template Helpers
 */
Template.TeamHome.helpers({
  team () {
    let teamId = FlowRouter.getParam('teamId');
    return Teams.findOne(teamId)
  }
});

/**
 * Template Event Handlers
 */
Template.TeamHome.events({});

/**
 * Template Created
 */
Template.TeamHome.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.TeamHome.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TeamHome.onDestroyed(() => {
  
});
