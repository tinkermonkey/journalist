import './capacity_plan_effort_items.html';
import { Template }   from 'meteor/templating';
import SimpleSchema   from 'simpl-schema';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import '../../../components/editable_item_selector/editable_item_selector';

/**
 * Template Helpers
 */
Template.CapacityPlanEffortItems.helpers({});

/**
 * Template Event Handlers
 */
Template.CapacityPlanEffortItems.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let itemId  = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey = $(e.target).attr('data-key');
    
    console.log('CapacityPlanEffortItems.edited:', itemId, dataKey, newValue);
    
    if (itemId && dataKey) {
      Meteor.call('editCapacityPlanStrategicEffortItem', itemId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-add-item' (e, instance) {
    let effort = this;
    console.log('Add item:', effort);
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Story Title'
          }
        })
      },
      title          : 'Add Planned Story',
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
            Meteor.call('addCapacityPlanStrategicEffortItem', effort.planId, effort._id, formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create capacity plan effort story:' + error.toString())
              } else {
                RobaDialog.hide();
              }
            });
            
            AutoForm.resetForm(formId)
          }
          return;
        }
        RobaDialog.hide();
      }.bind(this)
    });
  },
  'click .btn-delete-item' (e, instance) {
    let item = this;
    
    RobaDialog.ask('Delete Effort?', 'Are you sure that you want to delete from this plan the story <span class="label label-primary"> ' + item.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteCapacityPlanStrategicEffortItem', item._id, function (error, response) {
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
Template.CapacityPlanEffortItems.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.CapacityPlanEffortItems.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.CapacityPlanEffortItems.onDestroyed(() => {
  
});
