import './imported_item_page.html';
import { Template }      from 'meteor/templating';
import { ImportedItems } from '../../../../imports/api/imported_items/imported_items';
import '../../components/imported_items/imported_item';

/**
 * Template Helpers
 */
Template.ImportedItemPage.helpers({
  item () {
    let itemId = FlowRouter.getParam('itemId');
    console.log('ImportedItemPage:', itemId, ImportedItems.findOne(itemId));
    return ImportedItems.findOne(itemId)
  }
});

/**
 * Template Event Handlers
 */
Template.ImportedItemPage.events({});

/**
 * Template Created
 */
Template.ImportedItemPage.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let itemId = FlowRouter.getParam('itemId');
    instance.subscribe('imported_item', itemId);
  });
});

/**
 * Template Rendered
 */
Template.ImportedItemPage.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ImportedItemPage.onDestroyed(() => {
  
});
