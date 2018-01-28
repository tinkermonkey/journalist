import './capacity_plan.html';
import './capacity_plan.css';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { CapacityPlans } from '../../../../../imports/api/capacity_plans/capacity_plans';
import { CapacityPlanOptions } from '../../../../../imports/api/capacity_plans/capacity_plan_options';
import { CapacityPlanSprintBlocks } from '../../../../../imports/api/capacity_plans/capacity_plan_sprint_blocks';
import { CapacityPlanSprintLinks } from '../../../../../imports/api/capacity_plans/capacity_plan_sprint_links';
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
  chartContext () {
    let option = this;
    return {
      config: {},
      data  : {
        option : option,
        plan   : option.plan(),
        sprints: option.sprints().fetch(),
        links  : CapacityPlanSprintLinks.find({ optionId: option._id }).fetch(),
        blocks : CapacityPlanSprintBlocks.find({ optionId: option._id }).fetch()
      }
    }
  },
  startDatePickerConfig () {
    return {
      singleDatePicker: true,
      showDropdowns   : true,
      startDate       : this.startDate || new Date()
    }
  },
  sprintLengthOptions () {
    return {
      oneWeek   : 1 * 7 * 24 * 60 * 60 * 1000,
      twoWeeks  : 2 * 7 * 24 * 60 * 60 * 1000,
      threeWeeks: 3 * 7 * 24 * 60 * 60 * 1000
    }
  }
});

/**
 * Template Event Handlers
 */
Template.CapacityPlan.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let planId  = FlowRouter.getParam('planId'),
        dataKey = $(e.target).attr("data-key");
    
    if (planId && dataKey) {
      Meteor.call('editCapacityPlan', planId, dataKey, newValue, (error, response) => {
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
  }
});

/**
 * Template Created
 */
Template.CapacityPlan.onCreated(() => {
  let instance = Template.instance();

  instance.subscribe('imported_item_crumbs', {});
  
  instance.autorun(() => {
    let planId = FlowRouter.getParam('planId');
    
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
