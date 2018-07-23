import './imported_item_table.html';
import { Template }      from 'meteor/templating';
import { Random }        from 'meteor/random';
import { RobaDialog }    from 'meteor/austinsand:roba-dialog';
import { ImportedItems } from '../../../../imports/api/imported_items/imported_items';
import './imported_item_preview_link';

let pageSize   = 50,
    maxResults = 1000;

/**
 * Template Helpers
 */
Template.ImportedItemTable.helpers({
  importedItems () {
    let context = this,
        page    = Template.instance().page.get(),
        skip    = (page - 1) * pageSize;
    
    //console.log('ImportedItemTable.importedItems:', context, { sort: { identifier: 1 }, skip: skip, limit: pageSize });
    if (context && context.query) {
      return ImportedItems.find(context.query, { sort: { identifier: 1 }, skip: skip, limit: pageSize });
    } else if (context && context.items) {
      return context.items.slice(skip, pageSize)
    }
  },
  importedItemsCount () {
    return Template.instance().itemCount.get();
  },
  fromIndex () {
    let page = Template.instance().page.get();
    return (page - 1) * pageSize
  },
  toIndex () {
    let instance  = Template.instance(),
        page      = instance.page.get(),
        itemCount = instance.itemCount.get(),
        maxIndex  = page * pageSize;
    
    return Math.min(maxIndex, itemCount)
  },
  isCurrentPage () {
    let page        = parseInt(this),
        currentPage = Template.instance().page.get();
    return page === currentPage
  },
  multiplePages () {
    let itemCount = Template.instance().itemCount.get(),
        pageCount = Math.ceil(itemCount / pageSize);
    
    return pageCount > 1
  },
  pageCount () {
    let itemCount = Template.instance().itemCount.get();
    return Math.ceil(itemCount / pageSize)
  },
  pages () {
    let itemCount = Template.instance().itemCount.get(),
        pageCount = Math.ceil(itemCount / pageSize),
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
  
  instance.page      = new ReactiveVar(1);
  instance.queryId   = Random.id();
  instance.itemCount = new ReactiveVar(0);
  
  instance.autorun(() => {
    let context = Template.currentData();
    
    console.log('ImportedItemTable autorun:', context);
    
    if (context && context.query) {
      Meteor.call('getImportedItemQueryResultCount', context.query, (error, result) => {
        if (!error && result !== undefined) {
          console.log('getImportedItemQueryResultCount:', context.query, result);
          instance.itemCount.set(Math.min(parseInt(result), maxResults));
        } else {
          instance.itemCount.set(0);
          console.error('getImportedItemQueryResultCount failed:', error);
        }
      });
      //instance.subscribe('imported_item_query_count', context.query, instance.queryId);
      
      instance.subscribe('imported_item_crumb_query', context.query, { sort: { dateCreated: -1 } });
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
