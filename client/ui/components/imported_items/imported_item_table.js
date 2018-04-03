import './imported_item_table.html';
import { Template }           from 'meteor/templating';
import { Random }             from 'meteor/random';
import { RobaDialog }         from 'meteor/austinsand:roba-dialog';
import { ImportedItems }      from '../../../../imports/api/imported_items/imported_items';
import { ImportedItemCounts } from '../../pages/admin/projects/imported_item_counts';
import './imported_item_preview_link';

let pageSize = 50;

/**
 * Template Helpers
 */
Template.ImportedItemTable.helpers({
  importedItems () {
    let context = this;
    return ImportedItems.find(context.query, { sort: { identifier: 1 } });
  },
  importedItemsCount () {
    let countRow = ImportedItemCounts.findOne(Template.instance().queryId);
    return countRow && countRow.count;
  },
  fromIndex () {
    let page = Template.instance().page.get();
    return (page - 1) * pageSize
  },
  toIndex () {
    let instance = Template.instance(),
        page     = instance.page.get(),
        countRow = ImportedItemCounts.findOne(instance.queryId),
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
    let countRow  = ImportedItemCounts.findOne(Template.instance().queryId),
        pageCount = countRow && countRow.count ? Math.ceil(countRow.count / pageSize) : 0;
    
    return pageCount > 1
  },
  pageCount () {
    let countRow = ImportedItemCounts.findOne(Template.instance().queryId);
    return countRow.count ? Math.ceil(countRow.count / pageSize) : 0
  },
  pages () {
    let countRow  = ImportedItemCounts.findOne(Template.instance().queryId),
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
Template.ImportedItemTable.events({
  'click .imported-item-pages li' (e, instance) {
    let page = $(e.target).closest('li').attr('data-page');
    
    if (page) {
      instance.page.set(parseInt(page));
    }
  }
});

/**
 * Template Created
 */
Template.ImportedItemTable.onCreated(() => {
  let instance = Template.instance();
  
  instance.page    = new ReactiveVar(1);
  instance.queryId = Random.id();
  
  instance.autorun(() => {
    let context = Template.currentData(),
        page    = instance.page.get();
    
    if (context && context.query && page) {
      instance.subscribe('imported_item_query_count', context.query, instance.queryId);
      instance.subscribe('imported_item_crumb_query', context.query);
    }
  })
});

/**
 * Template Rendered
 */
Template.ImportedItemTable.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ImportedItemTable.onDestroyed(() => {
  
});