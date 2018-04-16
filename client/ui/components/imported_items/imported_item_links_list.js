import './imported_item_links_list.html';
import { Template } from 'meteor/templating';
import './imported_item_preview_link';

/**
 * Template Helpers
 */
Template.ImportedItemLinksList.helpers({
  inPopover () {
    return Template.instance().inPopover.get();
  }
});

/**
 * Template Event Handlers
 */
Template.ImportedItemLinksList.events({});

/**
 * Template Created
 */
Template.ImportedItemLinksList.onCreated(() => {
  let instance = Template.instance();
  
  instance.inPopover = new ReactiveVar(false);
});

/**
 * Template Rendered
 */
Template.ImportedItemLinksList.onRendered(() => {
  let instance  = Template.instance(),
      elementId = instance.elementId;
  
  if (elementId) {
    instance.inPopover.set($('#' + elementId).closest('.popover').length > 0);
  }
});

/**
 * Template Destroyed
 */
Template.ImportedItemLinksList.onDestroyed(() => {
  
});
