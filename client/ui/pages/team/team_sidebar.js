import './team_sidebar.html';
import { Template } from 'meteor/templating';
import { PublishedDisplayTemplates } from '../../../../imports/api/display_templates/published_display_templates';

/**
 * Template Helpers
 */
Template.TeamSidebar.helpers({
  teamReports () {
    let team = this;
    return PublishedDisplayTemplates.find({ templateName: { $in: team.reports } }, { sort: { templateName: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.TeamSidebar.events({});

/**
 * Template Created
 */
Template.TeamSidebar.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.TeamSidebar.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TeamSidebar.onDestroyed(() => {
  
});
