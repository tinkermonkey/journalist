import './anonymous_layout.html';
import './anonymous_layout.css';
import { Template } from 'meteor/templating';
import { Util }     from '../../../imports/api/util';

/**
 * Template Helpers
 */
Template.AnonymousLayout.helpers({});

/**
 * Template Event Handlers
 */
Template.AnonymousLayout.events({});

/**
 * Template Created
 */
Template.AnonymousLayout.onCreated(() => {
  let instance = Template.instance();
  
  Util.standardSubscriptions(instance);
});

/**
 * Template Rendered
 */
Template.AnonymousLayout.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AnonymousLayout.onDestroyed(() => {
  
});
