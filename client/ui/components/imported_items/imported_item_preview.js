import './imported_item_preview.css'
import './imported_item_preview.html';
import { Template }      from 'meteor/templating';
import { ImportedItems } from '../../../../imports/api/imported_items/imported_items';
import { Integrations }  from '../../../../imports/api/integrations/integrations';
import './default_imported_item_preview';

/**
 * Template Helpers
 */
Template.ImportedItemPreview.helpers({
  itemTemplate () {
    let item = this;
    if (item.integrationId) {
      let integration = Integrations.findOne(item.integrationId);
      
      return integration.previewDisplayTemplate || 'DefaultImportedItemPreview'
    }
  },
  item () {
    let itemId = this.toString();
    return ImportedItems.findOne(itemId);
  }
});

/**
 * Template Event Handlers
 */
Template.ImportedItemPreview.events({});

/**
 * Template Created
 */
Template.ImportedItemPreview.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let itemId = Template.currentData();
  
    instance.subscribe('imported_item', itemId);
  });
});

/**
 * Template Rendered
 */
Template.ImportedItemPreview.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ImportedItemPreview.onDestroyed(() => {
  
});
