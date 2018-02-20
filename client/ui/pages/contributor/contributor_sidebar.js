import './contributor_sidebar.html';
import { Template } from 'meteor/templating';
import '../../components/efforts/contributor_efforts.js';
import '../../components/priorities/contributor_priorities.js';
import '../../components/tasks/contributor_tasks.js';
import '../../components/team_roles/contributor_team_roles.js';
import { PublishedDisplayTemplates } from '../../../../imports/api/display_templates/published_display_templates';

/**
 * Template Helpers
 */
Template.ContributorSidebar.helpers({
  roleReports () {
    let role = this.defaultRole();
    return PublishedDisplayTemplates.find({ templateName: { $in: role.reports } }, { sort: { templateName: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.ContributorSidebar.events({});

/**
 * Template Created
 */
Template.ContributorSidebar.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ContributorSidebar.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ContributorSidebar.onDestroyed(() => {
  
});
