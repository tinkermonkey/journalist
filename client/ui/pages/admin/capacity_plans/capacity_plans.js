import './capacity_plans.html';
import { Template } from 'meteor/templating';
import { CapacityPlans } from '../../../../../imports/api/capacity_plans/capacity_plans';

/**
 * Template Helpers
 */
Template.CapacityPlans.helpers({
  activePlans () {
    return CapacityPlans.find({ isActive: true }, { sort: { title: 1 } })
  },
  archivedPlans () {
    return CapacityPlans.find({ isActive: false }, { sort: { title: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.CapacityPlans.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    let planId  = $(e.target).closest(".data-table-row").attr("data-pk"),
        dataKey = $(e.target).attr("data-key");
    
    if (planId && dataKey) {
      Meteor.call('editCapacityPlan', planId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-add-plan' (e, instance) {
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Plan Title'
          }
        })
      },
      title          : 'Add Capacity Plan',
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
            Meteor.call('addCapacityPlan', formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create capacity plan:' + error.toString())
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
  'click .btn-delete-plan' (e, instance) {
    let plan = this;
    
    RobaDialog.ask('Delete Plan?', 'Are you sure that you want to delete the capacity plan <span class="label label-primary"> ' + plan.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteCapacityPlan', plan._id, function (error, response) {
        if (error) {
          RobaDialog.error('Delete failed: ' + error.message);
        }
      });
    });
  },
});

/**
 * Template Created
 */
Template.CapacityPlans.onCreated(() => {

});

/**
 * Template Rendered
 */
Template.CapacityPlans.onRendered(() => {

});

/**
 * Template Destroyed
 */
Template.CapacityPlans.onDestroyed(() => {
  
});
