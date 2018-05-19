import './admin_backlog_table.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.AdminBacklogTable.helpers({});

/**
 * Template Event Handlers
 */
Template.AdminBacklogTable.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    let backlogId = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey   = $(e.target).attr('data-key');
    
    if (backlogId && dataKey) {
      Meteor.call('editBacklog', backlogId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-delete-backlog' (e, instance) {
    let backlog = this;
    
    RobaDialog.ask('Delete Backlog?', 'Are you sure that you want to delete the backlog <span class="label label-primary"> ' + backlog.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteBacklog', backlog._id, function (error, response) {
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
Template.AdminBacklogTable.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminBacklogTable.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminBacklogTable.onDestroyed(() => {
  
});
