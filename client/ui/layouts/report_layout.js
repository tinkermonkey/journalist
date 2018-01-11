import './report_layout.html';
import './report_layout.css';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.ReportLayout.helpers({});

/**
 * Template Event Handlers
 */
Template.ReportLayout.events({});

/**
 * Template Created
 */
Template.ReportLayout.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('contributors');
  instance.subscribe('contributor_role_definitions');
  instance.subscribe('contributor_team_roles');
  instance.subscribe('contributor_project_assignments');
  instance.subscribe('efforts');
  instance.subscribe('integration_display_templates');
  instance.subscribe('priorities');
  instance.subscribe('projects');
  instance.subscribe('status_report_settings');
  instance.subscribe('system_health_metrics');
  instance.subscribe('user_level');
  instance.subscribe('tasks');
  instance.subscribe('teams');
});

/**
 * Template Rendered
 */
Template.ReportLayout.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ReportLayout.onDestroyed(() => {
  
});
