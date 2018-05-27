import './filter_bar.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.FilterBar.helpers({
  filterItems () {
    if (this.filterVar) {
      let filter = this.filterVar.get() || {};
      
      return _.keys(filter).map((key) => {
        let filterItem = filter[ key ];
        filterItem.key = key;
        return filterItem
      })
    }
  }
});

/**
 * Template Event Handlers
 */
Template.FilterBar.events({
  'click .btn-remove-filter' (e, instance) {
    let filterItem = this,
        context    = Template.currentData();
    
    if (context && context.filterVar) {
      let filter = context.filterVar.get();
      delete filter[ filterItem.key ];
      context.filterVar.set(filter)
    }
  }
});

/**
 * Template Created
 */
Template.FilterBar.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.FilterBar.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.FilterBar.onDestroyed(() => {
  
});
