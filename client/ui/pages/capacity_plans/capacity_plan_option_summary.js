import './capacity_plan_option_summary.html';
import { Template }                 from 'meteor/templating';
import { CapacityPlanSprintBlocks } from '../../../../imports/api/capacity_plans/capacity_plan_sprint_blocks';
import { CapacityPlanBlockTypes }   from '../../../../imports/api/capacity_plans/capacity_plan_block_types';
import '../../components/height_limited_content/height_limited_content';

/**
 * Template Helpers
 */
Template.CapacityPlanOptionSummary.helpers({
  optionReleaseDate () {
    let release = this;
    return moment(release.releaseDate()).format('dddd, MMM Do')
  },
  multipleSprints (optionId) {
    let release = this;
    return release.sprintCount(optionId) > 1
  },
  sprintWeekCount (option) {
    return moment.duration(option.sprintLength).asWeeks()
  },
  teamHasContributions (option) {
    let team           = this,
        contributorIds = team.contributors().map((contributor) => {
          return contributor._id
        });
    return CapacityPlanSprintBlocks.find({
      optionId : option._id,
      blockType: CapacityPlanBlockTypes.contributor,
      dataId   : { $in: contributorIds }
    }).count() > 0
  },
  planRoles () {
    let context = Template.instance().data;
    
    return context.capacityPlan.roles().map((role) => {
      return role._id
    });
  }
});

/**
 * Template Event Handlers
 */
Template.CapacityPlanOptionSummary.events({});

/**
 * Template Created
 */
Template.CapacityPlanOptionSummary.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.CapacityPlanOptionSummary.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.CapacityPlanOptionSummary.onDestroyed(() => {
  
});
