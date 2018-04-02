import './release_items_fixed.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.ReleaseItemsFixed.helpers({});

/**
 * Template Event Handlers
 */
Template.ReleaseItemsFixed.events({});

/**
 * Template Created
 */
Template.ReleaseItemsFixed.onCreated(() => {
  let instance = Template.instance();
  
  console.log('ReleaseItemsFixed.onCreated:', instance.data);
});

/**
 * Template Rendered
 */
Template.ReleaseItemsFixed.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ReleaseItemsFixed.onDestroyed(() => {
  
});
