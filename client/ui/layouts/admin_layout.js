import './admin_layout.html';
import { Template } from 'meteor/templating';
import './authenticated_layout.js';

/**
 * Template Helpers
 */
Template.AdminLayout.helpers({});

/**
 * Template Event Handlers
 */
Template.AdminLayout.events({});

/**
 * Template Created
 */
Template.AdminLayout.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('contributors');
  instance.subscribe('user_level');
  instance.subscribe('integration_calculated_fields');
  instance.subscribe('integration_import_functions');
  instance.subscribe('integration_servers');
});

/**
 * Template Rendered
 */
Template.AdminLayout.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminLayout.onDestroyed(() => {
  
});
