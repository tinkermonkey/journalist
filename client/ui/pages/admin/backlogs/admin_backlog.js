import './admin_backlog.html';
import SimpleSchema from 'simpl-schema';
import { Template } from 'meteor/templating';
import { Backlogs } from '../../../../../imports/api/backlogs/backlogs';
import './admin_backlog_item_table';
import './admin_backlog_item_categories';

/**
 * Template Helpers
 */
Template.AdminBacklog.helpers({
  backlog () {
    let backlogId = FlowRouter.getParam('backlogId');
    if (backlogId) {
      return Backlogs.findOne(backlogId);
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdminBacklog.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    let backlogId = FlowRouter.getParam('backlogId'),
        dataKey   = $(e.target).attr('data-key');
    
    if (backlogId && dataKey) {
      Meteor.call('editBacklog', backlogId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-add-item' (e, instance) {
    let backlog = this;
    
    console.log('Backlog:', backlog);
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Item Title'
          }
        })
      },
      title          : 'Add Backlog Item',
      width          : 500,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Add' }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = 'addRecordForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the display template
            Meteor.call('addBacklogItem', formData.title, backlog._id, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create backlog item:' + error.toString())
              } else {
                RobaDialog.hide();
              }
            });
            
            AutoForm.resetForm(formId)
          }
        } else {
          RobaDialog.hide();
        }
      }.bind(this)
    });
  }
});

/**
 * Template Created
 */
Template.AdminBacklog.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let backlogId = FlowRouter.getParam('backlogId');
    
    instance.subscribe('admin_backlog', backlogId);
    instance.subscribe('admin_backlog_items', backlogId);
  })
});

/**
 * Template Rendered
 */
Template.AdminBacklog.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminBacklog.onDestroyed(() => {
  
});
