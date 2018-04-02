import './release_items_found.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.ReleaseItemsFound.helpers({});

/**
 * Template Event Handlers
 */
Template.ReleaseItemsFound.events({});

/**
 * Template Created
 */
Template.ReleaseItemsFound.onCreated(() => {
  let instance = Template.instance();
  
  console.log('ReleaseItemsFound.onCreated:', instance.data);
});

/**
 * Template Rendered
 */
Template.ReleaseItemsFound.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ReleaseItemsFound.onDestroyed(() => {
  
});
