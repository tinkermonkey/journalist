import './capacity_plan.html';
import './capacity_plan.css';
import { Template }            from 'meteor/templating';
import SimpleSchema            from 'simpl-schema';
import { moment }              from 'meteor/momentjs:moment';
import { RobaDialog }          from 'meteor/austinsand:roba-dialog';
import { CapacityPlans }       from '../../../../../imports/api/capacity_plans/capacity_plans';
import { CapacityPlanOptions } from '../../../../../imports/api/capacity_plans/capacity_plan_options';
import './capacity_plan_releases';
import './capacity_plan_efforts';
import './capacity_plan_option_summary';
import '../../../components/charts/capacity_plan_chart/capacity_plan_chart';
import '../../../components/editable_date_range/editable_date_range';

/**
 * Template Helpers
 */
Template.CapacityPlan.helpers({
  capacityPlan () {
    let planId = FlowRouter.getParam('planId');
    return CapacityPlans.findOne(planId)
  },
  isCurrentOption () {
    let optionId = FlowRouter.getParam('optionId');
    return this._id === optionId
  },
  currentOption () {
    let optionId = FlowRouter.getParam('optionId');
    return CapacityPlanOptions.findOne(optionId)
  },
  otherOptions () {
    let plan         = this,
        optionId     = FlowRouter.getParam('optionId'),
        otherOptions = plan.options().fetch().filter((option) => {
          return option._id !== optionId
        });
    
    return otherOptions.length > 0
  },
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
  },
  sprintLengthOptions () {
    return {
      oneWeek   : 1 * 7 * 24 * 60 * 60 * 1000,
      twoWeeks  : 2 * 7 * 24 * 60 * 60 * 1000,
      threeWeeks: 3 * 7 * 24 * 60 * 60 * 1000
    }
  },
  currentPlanningRole (roleId) {
    return Template.instance().currentPlanningRole.get();
  },
  isCurrentPlanningRole (roleId) {
    let currentRoleId = Template.instance().currentPlanningRole.get();
    return currentRoleId === roleId;
  },
  capacityPlanRoles () {
    let plan          = CapacityPlans.findOne(FlowRouter.getParam('planId')),
        currentRoleId = Template.instance().currentPlanningRole.get(),
        roles         = plan.roles();
    
    // If there's no current role set, set one
    if (!currentRoleId && roles.length) {
      Template.instance().currentPlanningRole.set(roles[ 0 ]._id)
    }
    
    return roles
  }
});

/**
 * Template Event Handlers
 */
Template.CapacityPlan.events({
  'edited .editable.capacity-plan' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let planId  = FlowRouter.getParam('planId'),
        dataKey = $(e.target).attr('data-key');
    
    //console.log('Plan Edit:', planId, dataKey, newValue);
    
    if (planId && dataKey) {
      Meteor.call('editCapacityPlan', planId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'edited .editable.capacity-plan-option' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let optionId = FlowRouter.getParam('optionId'),
        dataKey  = $(e.target).attr('data-key');
    
    //console.log('Option Edit:', optionId, dataKey, newValue);
    if (optionId && dataKey) {
      Meteor.call('editCapacityPlanOption', optionId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .start-date-picker' (e, instance) {
    instance.$('.start-date-picker').data('daterangepicker').show();
  },
  'click .capacity-plan-option-nav' (e, instance) {
    let option = this;
    FlowRouter.go(FlowRouter.path('CapacityPlanOption', { planId: option.planId, optionId: option._id }));
  },
  'click .btn-add-option' () {
    let planId = FlowRouter.getParam('planId');
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Option Title'
          }
        })
      },
      title          : 'Add Option',
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
            Meteor.call('addCapacityPlanOption', planId, formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create capacity plan option:' + error.toString())
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
  'click .btn-edit-option' () {
    let optionId = FlowRouter.getParam('optionId'),
        option   = CapacityPlanOptions.findOne(optionId);
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type        : String,
            label       : 'Option Title',
            defaultValue: option.title
          }
        })
      },
      title          : 'Edit Option',
      width          : 500,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Save' }
      ],
      callback       : function (btn) {
        if (btn.match(/save/i)) {
          let formId = 'addRecordForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the display template
            Meteor.call('editCapacityPlanOption', optionId, 'title', formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to update capacity plan option:' + error.toString())
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
  'click .btn-delete-option' (e, instance) {
    let plan         = this,
        optionId     = FlowRouter.getParam('optionId'),
        option       = CapacityPlanOptions.findOne(optionId),
        otherOptions = plan.options().fetch().filter((option) => {
          return option._id !== optionId
        });
    
    RobaDialog.ask('Delete Option?', 'Are you sure that you want to delete the option <span class="label label-primary"> ' + option.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteCapacityPlanOption', optionId, function (error, response) {
        if (error) {
          RobaDialog.error('Delete failed: ' + error.message);
        } else {
        }
      });
      if (otherOptions.length) {
        FlowRouter.go(FlowRouter.path('CapacityPlanOption', { planId: plan._id, optionId: otherOptions[ 0 ]._id }))
      }
    });
  },
  'click .capacity-plan-role-nav' (e, instance) {
    let role = this;
    
    console.log('Activate reporting role:', role);
    
    Template.instance().currentPlanningRole.set(role._id)
  },
});

/**
 * Template Created
 */
Template.CapacityPlan.onCreated(() => {
  let instance = Template.instance();
  
  instance.currentPlanningRole = new ReactiveVar();
  
  instance.subscribe('imported_item_crumb_query', {});
  
  instance.autorun(() => {
    let planId = FlowRouter.getParam('planId');
    
    instance.subscribe('capacity_plan_releases', planId);
    instance.subscribe('capacity_plan_sprints', planId);
    instance.subscribe('capacity_plan_sprint_blocks', planId);
    instance.subscribe('capacity_plan_sprint_links', planId);
    instance.subscribe('capacity_plan_strategic_efforts', planId);
    instance.subscribe('capacity_plan_strategic_effort_items', planId);
  });
  
  instance.autorun(() => {
    let planId   = FlowRouter.getParam('planId'),
        optionId = FlowRouter.getParam('optionId');
    
    //console.log('CapacityPlan option check autorun');
    if (!optionId && instance.subscriptionsReady()) {
      //console.log('CapacityPlan option check autorun looking for first option');
      let firstOption = CapacityPlanOptions.findOne({ planId: planId });
      if (firstOption) {
        //console.log('CapacityPlan option check autorun found an option:', firstOption);
        FlowRouter.go(FlowRouter.path('CapacityPlanOption', { planId: planId, optionId: firstOption._id }));
      }
    } else if (optionId) {
      //console.log('CapacityPlan option check autorun option already set:', optionId);
    }
  });
});

/**
 * Template Rendered
 */
Template.CapacityPlan.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let planId = FlowRouter.getParam('planId'),
        plan   = CapacityPlans.findOne(planId);
    
  })
});

/**
 * Template Destroyed
 */
Template.CapacityPlan.onDestroyed(() => {
  
});
