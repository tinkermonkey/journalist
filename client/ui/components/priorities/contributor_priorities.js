import './contributor_priorities.html';
import { Template }   from 'meteor/templating';
import SimpleSchema   from 'simpl-schema';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Priorities } from '../../../../imports/api/priorities/priorities.js';
import '../add_record_form/add_record_form.js';

/**
 * Template Helpers
 */
Template.ContributorPriorities.helpers({});

/**
 * Template Event Handlers
 */
Template.ContributorPriorities.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let priorityId = $(e.target).closest('.sortable-table-row').attr('data-pk'),
        dataKey    = $(e.target).attr('data-key');
    
    console.log('ContributorPriorities edited:', priorityId, dataKey, newValue);
    if (priorityId && dataKey) {
      Meteor.call('editPriority', priorityId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-add-priority' (e, instance) {
    let contributorId = $(e.target).closest('.contributor-priorities').attr('data-pk');
    
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
      title          : 'Add Priority',
      width          : 500,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Add' }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = $('.roba-dialog form').attr('id');
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the priority
            console.log('AddRecordForm:', btn, AutoForm.validateForm(formId), AutoForm.getFormValues(formId).insertDoc);
            Meteor.call('addPriority', contributorId, formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create priority:' + error.toString())
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
  'click .btn-delete-priority' (e, instance) {
    let priorityId = $(e.target).closest('.sortable-table-row').attr('data-pk'),
        priority   = Priorities.findOne(priorityId);
    
    RobaDialog.ask('Delete Priority?', 'Are you sure that you want to delete the priority <span class="label label-primary"> ' + priority.title + '</span> ?', () => {
      Meteor.call('deletePriority', priorityId, function (error, response) {
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
Template.ContributorPriorities.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ContributorPriorities.onRendered(() => {
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
          instance.$('.sortable-table-row').each(function (i, el) {
            let newOrder    = i + 1,
                storedOrder = $(el).attr('data-sort-order');
            if (newOrder !== storedOrder) {
              let rowId = $(el).attr('data-pk');
              console.log('Updating order: ', newOrder, rowId);
              Meteor.call('editPriority', rowId, 'order', newOrder, function (error, response) {
                if (error) {
                  RobaDialog.error('Priority order update failed: ' + error.message);
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
Template.ContributorPriorities.onDestroyed(() => {
  
});
