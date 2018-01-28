import './editable_item_search.html';
import { Template } from 'meteor/templating';
import { ImportedItemCrumbs } from '../../../../imports/api/imported_items/imported_item_crumbs';

/**
 * Template Helpers
 */
Template.EditableItemSearch.helpers({
  searchResults () {
    let searchTerm = Template.instance().searchTerm.get();
    if (_.isString(searchTerm) && searchTerm.length) {
      searchTerm = searchTerm.toLowerCase();
      return ImportedItemCrumbs.find({
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { identifier: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      }, { sort: { dateCreated: -1 }, limit: 10 })
    }
  }
});

/**
 * Template Event Handlers
 */
Template.EditableItemSearch.events({
  'keyup .search-input' (e, instance) {
    let searchTerm = instance.$('.search-input').val();
    
    if (searchTerm && searchTerm.length > 2) {
      if (Date.now() - instance.lastSearch > 250) {
        instance.lastSearch = Date.now();
        instance.searchTerm.set(searchTerm);
      } else {
        clearTimeout(instance.searchTimeout);
        instance.searchTimeout = setTimeout(() => {
          instance.lastSearch = Date.now();
          instance.searchTerm.set(searchTerm);
        }, 250);
      }
    } else {
      instance.searchTerm.set();
    }
  },
  'click .search-result' (e, instance) {
    let result = this;
    
    if (instance.data.valueField) {
      console.log('EditableItemSearch item selected:', result[ instance.data.valueField ]);
      $(e.target).trigger('edited', [result[instance.data.valueField]])
    } else {
      console.log('EditableItemSearch item selected:', result);
      $(e.target).trigger('edited', [result])
    }
  }
});

/**
 * Template Created
 */
Template.EditableItemSearch.onCreated(() => {
  let instance = Template.instance();
  
  instance.searchTerm = new ReactiveVar();
  instance.lastSearch = 0;
});

/**
 * Template Rendered
 */
Template.EditableItemSearch.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.EditableItemSearch.onDestroyed(() => {
  
});
