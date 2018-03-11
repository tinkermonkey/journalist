import './capacity_plan_list.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.CapacityPlanList.helpers({
  startDatePickerConfig () {
    return {
      singleDatePicker: true,
      showDropdowns   : true,
      startDate       : this.startDate || new Date(),
      isInvalidDate (testDate) {
        // limit the selection to week starts
        return moment(testDate).weekday() === 1
      }
    }
  }
});

/**
 * Template Event Handlers
 */
Template.CapacityPlanList.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    let planId  = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey = $(e.target).attr('data-key');
    
    if (planId && dataKey) {
      Meteor.call('editCapacityPlan', planId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
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
  }
});

/**
 * Template Created
 */
Template.CapacityPlanList.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.CapacityPlanList.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.CapacityPlanList.onDestroyed(() => {
  
});
