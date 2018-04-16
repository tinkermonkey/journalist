import './imported_item_preview_link.html';
import { Template }      from 'meteor/templating';
import '../quick_popover/quick_popover';
import './imported_item_preview';
import { ImportedItems } from '../../../../imports/api/imported_items/imported_items';

/**
 * Template Helpers
 */
Template.ImportedItemPreviewLink.helpers({
  /**
   * Grab something with the title and identifier for display purposes
   */
  itemCrumb () {
    let itemId = this.toString();
    
    return ImportedItems.findOne(itemId);
  },
  previewTemplate () {
    return Template.ImportedItemPreview
  }
});

/**
 * Template Event Handlers
 */
Template.ImportedItemPreviewLink.events({});

/**
 * Template Created
 */
Template.ImportedItemPreviewLink.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let itemId = Template.currentData().toString();
    
    instance.subscribe('imported_item', itemId);
  })
});

/**
 * Template Rendered
 */
Template.ImportedItemPreviewLink.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ImportedItemPreviewLink.onDestroyed(() => {
  
});
