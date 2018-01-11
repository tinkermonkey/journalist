import './admin_integration_imported_item_browser.html';
import { Template } from 'meteor/templating';
import { ImportedItems } from '../../../../../imports/api/imported_items/imported_items';
import { ImportedItemCounts } from './imported_item_counts';

let pageSize = 50;

/**
 * Template Helpers
 */
Template.AdminIntegrationImportedItemBrowser.helpers({
  importedItems () {
    let integration = this;
    return ImportedItems.find({ integrationId: integration._id }, { sort: { identifier: 1 } });
  },
  importedItemsCount () {
    let integration = this,
        countRow    = ImportedItemCounts.findOne(integration._id);
    return countRow && countRow.count;
  },
  fromIndex () {
    let page = Template.instance().page.get();
    return (page - 1) * pageSize
  },
  toIndex () {
    let page        = Template.instance().page.get(),
        integration = this,
        countRow    = ImportedItemCounts.findOne(integration._id),
        maxIndex    = page * pageSize;
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
    let integration = this,
        countRow    = ImportedItemCounts.findOne(integration._id),
        pageCount   = countRow && countRow.count ? Math.ceil(countRow.count / pageSize) : 0;
    
    return pageCount > 1
  },
  pageCount () {
    let integration = this,
        countRow    = ImportedItemCounts.findOne(integration._id);
    return countRow.count ? Math.ceil(countRow.count / pageSize) : 0
  },
  pages () {
    let integration = this,
        countRow    = ImportedItemCounts.findOne(integration._id),
        pageCount   = countRow.count ? Math.ceil(countRow.count / pageSize) : 0,
        pages       = [];
    
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
  },
  'click .btn-reprocess-issues'(e, instance){
    
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
