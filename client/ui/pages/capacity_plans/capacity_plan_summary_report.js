import './capacity_plan_summary_report.html';
import { Template }      from 'meteor/templating';
import { CapacityPlans } from '../../../../imports/api/capacity_plans/capacity_plans';
import './capacity_plan.css';
import './capacity_plan_releases';
import './capacity_plan_efforts';
import './capacity_plan_option_summary';
import '../../components/charts/capacity_plan_chart/capacity_plan_chart';
import '../../components/editable_date_range/editable_date_range';

/**
 * Template Helpers
 */
Template.CapacityPlanSummaryReport.helpers({
  capacityPlan () {
    let planId = FlowRouter.getParam('planId');
    return CapacityPlans.findOne(planId)
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
Template.CapacityPlanSummaryReport.events({});

/**
 * Template Created
 */
Template.CapacityPlanSummaryReport.onCreated(() => {
  let instance = Template.instance();
  
  instance.currentPlanningRole = new ReactiveVar();
  
  instance.subscribe('imported_item_crumbs', {});
  
  instance.autorun(() => {
    let planId = FlowRouter.getParam('planId');
  
    instance.subscribe('capacity_plan', planId);
    instance.subscribe('capacity_plan_options', planId);
    instance.subscribe('capacity_plan_releases', planId);
    instance.subscribe('capacity_plan_sprints', planId);
    instance.subscribe('capacity_plan_sprint_blocks', planId);
    instance.subscribe('capacity_plan_sprint_links', planId);
    instance.subscribe('capacity_plan_strategic_efforts', planId);
    instance.subscribe('capacity_plan_strategic_effort_items', planId);
  });
});

/**
 * Template Rendered
 */
Template.CapacityPlanSummaryReport.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.CapacityPlanSummaryReport.onDestroyed(() => {
  
});
