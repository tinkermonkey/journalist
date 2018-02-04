import './project_sidebar.html';
import { Template }                  from 'meteor/templating';
import { PublishedDisplayTemplates } from '../../../../imports/api/display_templates/published_display_templates';

/**
 * Template Helpers
 */
Template.ProjectSidebar.helpers({
  projectReports () {
    let project = this;
    return PublishedDisplayTemplates.find({ templateName: { $in: project.reports } }, { sort: { templateName: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.ProjectSidebar.events({});

/**
 * Template Created
 */
Template.ProjectSidebar.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ProjectSidebar.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ProjectSidebar.onDestroyed(() => {
  
});
