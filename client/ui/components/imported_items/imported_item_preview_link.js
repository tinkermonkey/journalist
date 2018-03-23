import './imported_item_preview_link.html';
import { Template }           from 'meteor/templating';
import '../quick_popover/quick_popover';
import './imported_item_preview';
import { ImportedItemCrumbs } from '../../../../imports/api/imported_items/imported_item_crumbs';
import { ImportedItems }      from '../../../../imports/api/imported_items/imported_items';

/**
 * Template Helpers
 */
Template.ImportedItemPreviewLink.helpers({
  /**
   * Grab something with the title and identifier for display purposes
   */
  itemCrumb () {
    let itemId = this.toString(),
        crumb  = ImportedItemCrumbs.findOne(itemId);
    if (crumb) {
      //console.log('ImportedItemPreviewLink.itemCrumb:', itemId, crumb);
      return crumb
    } else {
      //let item = ImportedItems.findOne(itemId);
      //console.log('ImportedItemPreviewLink.itemCrumb:', itemId, item);
      return ImportedItems.findOne(itemId);
    }
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
