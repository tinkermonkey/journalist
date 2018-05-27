import './top_nav_search_results.html';
import { Template }           from 'meteor/templating';
import { Contributors }       from '../../../../imports/api/contributors/contributors';
import { ImportedItems } from '../../../../imports/api/imported_items/imported_items';
import '../imported_items/imported_item_quick_search_result';

/**
 * Template Helpers
 */
Template.TopNavSearchResults.helpers({
  contributors () {
    return Contributors.find({
      $or: [
        { name: { $regex: this.searchTerm, $options: 'i' } },
        { email: { $regex: this.searchTerm, $options: 'i' } }
      ]
    }, { sort: { name: 1 } })
  },
  importedItems () {
    return ImportedItems.find({
      $or: [
        { title: { $regex: this.searchTerm, $options: 'i' } },
        { identifier: { $regex: this.searchTerm, $options: 'i' } }
      ]
    }, { sort: { dateModified: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.TopNavSearchResults.events({
  'click .imported-item-quick-search-result' (e, instance) {
    let itemId = $(e.target).closest('.imported-item-quick-search-result').attr('data-pk');
    if (!$(e.target).closest('a').length) {
      FlowRouter.go(FlowRouter.path('ImportedItem', { itemId: itemId }))
    }
  }
});

/**
 * Template Created
 */
Template.TopNavSearchResults.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let context = Template.currentData();
    
    if (context.searchTerm) {
      instance.subscribe('imported_item_crumb_query', {
        $or: [
          { title: { $regex: context.searchTerm, $options: 'i' } },
          { identifier: { $regex: context.searchTerm, $options: 'i' } }
        ]
      })
    }
  })
});

/**
 * Template Rendered
 */
Template.TopNavSearchResults.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TopNavSearchResults.onDestroyed(() => {
  
});
