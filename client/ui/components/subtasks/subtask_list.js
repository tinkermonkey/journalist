import './subtask_list.html';
import './subtask_list.css';
import { Template }   from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Subtasks }   from '../../../../imports/api/subtasks/subtasks';
import '../../components/confirmed_button/confirmed_button';

/**
 * Template Helpers
 */
Template.SubtaskList.helpers({
  subtasks () {
    let context = this;
    return Subtasks.find({
      sourceCollection: context.sourceCollection,
      sourceId        : context.sourceId
    }, { sort: { order: 1 } })
  },
  newSubtaskValue () {
    let context = this,
        tasks   = Subtasks.find({
          sourceCollection: context.sourceCollection,
          sourceId        : context.sourceId
        }, { sort: { order: 1 } }).fetch();
    
    return ''
  },
  dueDatePickerConfig () {
    return {
      singleDatePicker: true,
      showDropdowns   : true,
      startDate       : new Date()
    }
  },
  doorbell () {
    Template.instance().reRender.set(Date.now());
  }
});

/**
 * Template Event Handlers
 */
Template.SubtaskList.events({
  'edited .editable' (e, instance, newValue) {
    let subtaskId = $(e.target).closest('.subtask-list-item').attr('data-pk'),
        dataKey   = $(e.target).attr('data-key');
    
    if (subtaskId) {
      // Edit an existing subtask
      Meteor.call('editSubtask', subtaskId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Failed to edit subtask:' + error.toString())
        }
      });
    } else if (dataKey === 'newSubtask' && _.isString(newValue) && newValue.length) {
      let context = instance.data;
      
      console.log('addSubtask', context.contributorId, context.sourceCollection, context.sourceId, newValue);
      
      // Create a new subtask
      Meteor.call('addSubtask', context.contributorId, context.sourceCollection, context.sourceId, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Failed to add subtask:' + error.toString())
        }
      });
    }
  },
  'click .btn-delete-subtask' (e, instance) {
    let subtaskId = $(e.target).closest('.subtask-list-item').attr('data-pk');
    
    if (subtaskId) {
      Meteor.call('deleteSubtask', subtaskId, function (error, response) {
        if (error) {
          RobaDialog.error('Delete failed: ' + error.message);
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.SubtaskList.onCreated(() => {
  let instance = Template.instance();
  
  instance.reRender = new ReactiveVar(Date.now());
  
  instance.autorun(() => {
    let context = Template.currentData();
    
    instance.subscribe('subtasks', context.sourceCollection, context.sourceId);
  })
});

/**
 * Template Rendered
 */
Template.SubtaskList.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let reRender = instance.reRender.get();
    
    if (instance.subscriptionsReady() && reRender) {
      clearTimeout(instance.sortableTimeout);
      instance.sortableTimeout = setTimeout(() => {
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
                    
                    Meteor.call('editSubtask', rowId, 'order', newOrder, function (error, response) {
                      if (error) {
                        RobaDialog.error('Priority order update failed: ' + error.message);
                      }
                    });
                  }
                });
              }
            })
            .disableSelection();
      }, 250);
    }
  });
});

/**
 * Template Destroyed
 */
Template.SubtaskList.onDestroyed(() => {
  
});
