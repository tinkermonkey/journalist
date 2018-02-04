import './authenticated_layout.html';
import { Template } from 'meteor/templating';
import '../pages/not_found/not_found';
import '../components/login/login';
import '../components/misc/app_loading';
import '../components/top_nav/top_nav';
import './display_template_layer';
import { Util }     from '../../../imports/api/util';

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
  
  console.log(Util.timestamp(), 'AuthenticatedLayout created');
  Util.standardSubscriptions(instance);
  
  instance.autorun(() => {
    if (instance.subscriptionsReady()) {
      console.log(Util.timestamp(), 'AuthenticatedLayout data loaded');
    }
  })
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
