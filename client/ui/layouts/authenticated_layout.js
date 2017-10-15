import './authenticated_layout.html';

import { Template } from 'meteor/templating';

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
  instance.subscribe('system_status_metrics');
  instance.subscribe('user_level');
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
