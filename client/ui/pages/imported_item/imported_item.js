import './imported_item.html';
import { Template }      from 'meteor/templating';
import '../../components/imported_items/default_imported_item_preview';
import { Integrations }  from '../../../../imports/api/integrations/integrations';
import { ImportedItems } from '../../../../imports/api/imported_items/imported_items';

/**
 * Template Helpers
 */
Template.ImportedItem.helpers({
  itemTemplate () {
    let item = this;
    if (item.integrationId) {
      let integration = Integrations.findOne(item.integrationId);
      
      return integration.detailDisplayTemplate || 'DefaultImportedItemPreview'
    }
  },
  item () {
    let itemId = FlowRouter.getParam('itemId');
    return ImportedItems.findOne(itemId)
  }
});

/**
 * Template Event Handlers
 */
Template.ImportedItem.events({});

/**
 * Template Created
 */
Template.ImportedItem.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let itemId = FlowRouter.getParam('itemId');
    instance.subscribe('imported_item', itemId);
  });
});

/**
 * Template Rendered
 */
Template.ImportedItem.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ImportedItem.onDestroyed(() => {
  
});
