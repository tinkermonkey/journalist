import './admin_layout.html';
import { Template } from 'meteor/templating';
import '../pages/not_found/not_found.js';

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
  instance.subscribe('system_status_metrics');
  instance.subscribe('user_level');
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
