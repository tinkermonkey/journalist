import './team_active_capacity_plan.html';
import { Template }                 from 'meteor/templating';
import { CapacityPlans }            from '../../../../imports/api/capacity_plans/capacity_plans';
import { CapacityPlanOptions }      from '../../../../imports/api/capacity_plans/capacity_plan_options';
import { CapacityPlanSprintBlocks } from '../../../../imports/api/capacity_plans/capacity_plan_sprint_blocks';
import { CapacityPlanBlockTypes }   from '../../../../imports/api/capacity_plans/capacity_plan_block_types';
import '../../components/charts/capacity_plan_chart/capacity_plan_chart';

/**
 * Template Helpers
 */
Template.TeamActiveCapacityPlan.helpers({
  chosenCapacityPlanOption () {
    let team       = this,
        activePlan = CapacityPlans.findOne({ isActive: true, teamIds: team._id });
    
    if (activePlan && activePlan.selectedOptionId) {
      return CapacityPlanOptions.findOne(activePlan.selectedOptionId)
    }
  },
  teamHasContributions (team, option) {
    let contributorIds = team.contributors().map((contributor) => {
          return contributor._id
        });
    return CapacityPlanSprintBlocks.find({
      optionId : option._id,
      blockType: CapacityPlanBlockTypes.contributor,
      dataId   : { $in: contributorIds }
    }).count() > 0
  },
  planRoles () {
    console.log('planRoles option:', this.plan().roles().map((role) => {
      return role._id
    }));
    return this.plan().roles().map((role) => {
      return role._id
    });
  }
});

/**
 * Template Event Handlers
 */
Template.TeamActiveCapacityPlan.events({});

/**
 * Template Created
 */
Template.TeamActiveCapacityPlan.onCreated(() => {
  let instance = Template.instance();
  
  // Subscribe to the option needed
  instance.autorun(() => {
    let team = Template.currentData();
    
    if (team) {
      let activePlan = CapacityPlans.findOne({ isActive: true, teamIds: team._id });
      if (activePlan && activePlan.selectedOptionId) {
        instance.subscribe('capacity_plan_options', activePlan._id);
        instance.subscribe('capacity_plan_releases', activePlan._id);
        instance.subscribe('capacity_plan_sprints', activePlan._id);
        instance.subscribe('capacity_plan_sprint_blocks', activePlan._id);
        instance.subscribe('capacity_plan_sprint_links', activePlan._id);
        instance.subscribe('capacity_plan_strategic_efforts', activePlan._id);
        instance.subscribe('capacity_plan_strategic_effort_items', activePlan._id);
      }
    }
  });
});

/**
 * Template Rendered
 */
Template.TeamActiveCapacityPlan.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TeamActiveCapacityPlan.onDestroyed(() => {
  
});
