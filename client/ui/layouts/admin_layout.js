import './admin_layout.html';
import { Template } from 'meteor/templating';
import '../pages/not_found/not_found';
import '../components/login/login';
import '../components/misc/app_loading';
import '../components/top_nav/top_nav';
import './display_template_layer';
import { Util } from '../../../imports/api/util';

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
  
  Util.standardSubscriptions(instance);
  instance.subscribe('display_templates');
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
