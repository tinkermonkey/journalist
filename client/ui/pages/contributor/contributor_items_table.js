import './contributor_items_table.html';
import { Template }           from 'meteor/templating';
import { ImportedItems } from '../../../../imports/api/imported_items/imported_items';

/**
 * Template Helpers
 */
Template.ContributorItemsTable.helpers({
  importedItems () {
    let context = this;
    if (context.query) {
      return ImportedItems.find(context.query, context.sort)
    }
  }
});

/**
 * Template Event Handlers
 */
Template.ContributorItemsTable.events({});

/**
 * Template Created
 */
Template.ContributorItemsTable.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let context = Template.currentData();
    
    if (context.query) {
      instance.subscribe('imported_item_crumb_query', context.query)
    }
  });
});

/**
 * Template Rendered
 */
Template.ContributorItemsTable.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ContributorItemsTable.onDestroyed(() => {
  
});
