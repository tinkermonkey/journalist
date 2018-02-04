import './contributor_items_table.html';
import { Template }           from 'meteor/templating';
import { ImportedItemCrumbs } from '../../../../imports/api/imported_items/imported_item_crumbs';

/**
 * Template Helpers
 */
Template.ContributorItemsTable.helpers({
  importedItemCrumbs () {
    let context = this;
    if (context.query) {
      return ImportedItemCrumbs.find(context.query, context.sort)
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
