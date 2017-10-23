import './authenticated_layout.html';
import { Template } from 'meteor/templating';
import '../pages/not_found/not_found.js';
import '../components/login/login.js';
import '../components/misc/app_loading.js';
import '../components/top_nav/top_nav.js';

/**
 * Template Helpers
 */
Template.AuthenticatedLayout.helpers({});

/**
 * Template Event Handlers
 */
Template.AuthenticatedLayout.events({});

/**
 * Template Created
 */
Template.AuthenticatedLayout.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('contributors');
  instance.subscribe('contributor_team_roles');
  instance.subscribe('efforts');
  instance.subscribe('priorities');
  instance.subscribe('projects');
  instance.subscribe('system_status_metrics');
  instance.subscribe('user_level');
  instance.subscribe('tasks');
  instance.subscribe('teams');
});

/**
 * Template Rendered
 */
Template.AuthenticatedLayout.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AuthenticatedLayout.onDestroyed(() => {
  
});
