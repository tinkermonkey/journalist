import './admin_backlog_item_table.html';
import './admin_backlog_item_table.css';
import { Template } from 'meteor/templating';
import './admin_backlog_item_resource_allocations';
import './admin_backlog_item_resource_requirements';

/**
 * Template Helpers
 */
Template.AdminBacklogItemTable.helpers({
  tableRowContext () {
    let item = this;
    
    item.backlog = Template.parentData(1);
    
    return item
  }
});

/**
 * Template Event Handlers
 */
Template.AdminBacklogItemTable.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    let itemId  = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey = $(e.target).attr('data-key');
    
    console.log('Edited:', itemId, dataKey, newValue);
    
    if (itemId && dataKey) {
      Meteor.call('editBacklogItem', itemId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-delete' (e, instance) {
    let item = this;
    
    RobaDialog.ask('Delete Item?', 'Are you sure that you want to delete the item <span class="label label-primary"> ' + item.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteBacklogItem', item._id, function (error, response) {
        if (error) {
          RobaDialog.error('Delete failed: ' + error.message);
        }
      });
    });
  }
});

/**
 * Template Created
 */
Template.AdminBacklogItemTable.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminBacklogItemTable.onRendered(() => {
  let instance = Template.instance();
  
  instance.$('.sortable-table')
      .sortable({
        items               : '> .sortable-table-row',
        handle              : '.drag-handle',
        helper (e, ui) {
          // fix the width
          ui.children().each(function () {
            $(this).width($(this).width());
          });
          return ui;
        },
        axis                : 'y',
        forcePlaceholderSize: true,
        update (event, ui) {
          let backlogId = instance.$('.sortable-table').attr('data-pk');
          
          instance.$('.sortable-table-row').each(function (i, el) {
            let newOrder    = i + 1,
                storedOrder = $(el).attr('data-sort-order');
            
            if (newOrder !== storedOrder) {
              let rowId = $(el).attr('data-pk');
              
              Meteor.call('editBacklogItemOrder', rowId, backlogId, newOrder, function (error, response) {
                if (error) {
                  RobaDialog.error('Order update failed: ' + error.message);
                }
              });
            }
          });
        }
      })
      .disableSelection();
});

/**
 * Template Destroyed
 */
Template.AdminBacklogItemTable.onDestroyed(() => {
  
});
