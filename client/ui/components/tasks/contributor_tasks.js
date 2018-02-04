import './contributor_tasks.html';
import { Template }   from 'meteor/templating';
import SimpleSchema   from 'simpl-schema';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Tasks }      from '../../../../imports/api/tasks/tasks.js';
import '../add_record_form/add_record_form.js';

/**
 * Template Helpers
 */
Template.ContributorTasks.helpers({});

/**
 * Template Event Handlers
 */
Template.ContributorTasks.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let taskId  = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey = $(e.target).attr('data-key');
    
    console.log('ContributorTasks edited:', taskId, dataKey, newValue);
    if (taskId && dataKey) {
      Meteor.call('editTask', taskId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-add-task' (e, instance) {
    let contributorId = $(e.target).closest('.contributor-tasks').attr('data-pk');
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Title'
          }
        })
      },
      title          : 'Add Task',
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
            
            // Create the task
            Meteor.call('addTask', contributorId, formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create task:' + error.toString())
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
  },
  'click .btn-delete-task' (e, instance) {
    let taskId = $(e.target).closest('.data-table-row').attr('data-pk'),
        task   = Tasks.findOne(taskId);
    
    RobaDialog.ask('Delete Task?', 'Are you sure that you want to delete the task <span class="label label-primary"> ' + task.title + '</span> ?', () => {
      Meteor.call('deleteTask', taskId, function (error, response) {
        if (error) {
          RobaDialog.error('Delete failed: ' + error.message);
        } else {
          RobaDialog.hide();
        }
      });
    });
  }
});

/**
 * Template Created
 */
Template.ContributorTasks.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ContributorTasks.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ContributorTasks.onDestroyed(() => {
  
});
