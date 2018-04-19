import './release_plan_cell.html';
import { Template }                from 'meteor/templating';
import { CapacityPlanSprintBlocks } from '../../../../../imports/api/capacity_plans/capacity_plan_sprint_blocks';

/**
 * Template Helpers
 */
Template.ReleasePlanCell.helpers({
  efforts(){
    let effortIds = CapacityPlanSprintBlocks.find
  }
});

/**
 * Template Event Handlers
 */
Template.ReleasePlanCell.events({});

/**
 * Template Created
 */
Template.ReleasePlanCell.onCreated(() => {

});

/**
 * Template Rendered
 */
Template.ReleasePlanCell.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ReleasePlanCell.onDestroyed(() => {
  
});
