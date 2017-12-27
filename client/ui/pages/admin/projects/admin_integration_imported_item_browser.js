import './admin_integration_imported_item_browser.html';
import { Template } from 'meteor/templating';
import { ImportedItems } from '../../../../../imports/api/imported_items/imported_items';

let pageSize = 50,
    counts   = new Mongo.Collection('counts');

/**
 * Template Helpers
 */
Template.AdminIntegrationImportedItemBrowser.helpers({
  importedItems () {
    let integration = this;
    return ImportedItems.find({ integrationId: integration._id }, { sort: { identifier: 1 } });
  },
  importedItemsCount () {
    let countRow = counts.findOne('importedItemsCount');
    return countRow && countRow.count;
  },
  fromIndex () {
    let page = Template.instance().page.get();
    return (page - 1) * pageSize
  },
  toIndex () {
    let page     = Template.instance().page.get(),
        countRow = counts.findOne('importedItemsCount'),
        maxIndex = page * pageSize;
    if (countRow && countRow.count) {
      return Math.min(maxIndex, countRow.count)
    } else {
      return maxIndex
    }
  },
  isCurrentPage () {
    let page        = parseInt(this),
        currentPage = Template.instance().page.get();
    return page === currentPage
  },
  multiplePages () {
    let countRow  = counts.findOne('importedItemsCount'),
        pageCount = countRow && countRow.count ? Math.ceil(countRow.count / pageSize) : 0;
    
    return pageCount > 1
  },
  pageCount () {
    let countRow = counts.findOne('importedItemsCount');
    return countRow.count ? Math.ceil(countRow.count / pageSize) : 0
  },
  pages () {
    let countRow  = counts.findOne('importedItemsCount'),
        pageCount = countRow.count ? Math.ceil(countRow.count / pageSize) : 0,
        pages     = [];
    
    for (let page = 1; page <= pageCount; page++) {
      pages.push(page);
    }
    
    return pages
  }
});

/**
 * Template Event Handlers
 */
Template.AdminIntegrationImportedItemBrowser.events({
  'click .imported-item-pages li' (e, instance) {
    let page = $(e.target).closest('li').attr('data-page');
    
    console.log('Page:', page);
    
    if (page) {
      instance.page.set(parseInt(page));
    }
  }
});

/**
 * Template Created
 */
Template.AdminIntegrationImportedItemBrowser.onCreated(() => {
  let instance = Template.instance();
  
  instance.page = new ReactiveVar(1);
  
  instance.autorun(() => {
    let integration = Template.currentData(),
        page        = instance.page.get();
    
    if (integration && integration._id) {
      instance.subscribe('integration_imported_item_count', integration._id);
      instance.subscribe('integration_imported_items', integration._id, (page - 1) * pageSize, pageSize);
    }
  })
});

/**
 * Template Rendered
 */
Template.AdminIntegrationImportedItemBrowser.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminIntegrationImportedItemBrowser.onDestroyed(() => {
  
});
