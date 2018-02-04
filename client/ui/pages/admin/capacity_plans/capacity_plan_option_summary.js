import './capacity_plan_option_summary.html';
import { Template } from 'meteor/templating';
import '../../../components/height_limited_content/height_limited_content';

/**
 * Template Helpers
 */
Template.CapacityPlanOptionSummary.helpers({
  optionReleaseDate (optionId) {
    let release = this;
    return moment(release.releaseDate(optionId)).format('dddd, MMM Do')
  },
  multipleSprints (optionId) {
    let release = this;
    return release.sprintCount(optionId) > 1
  },
  sprintWeekCount (option) {
    return moment.duration(option.sprintLength).asWeeks()
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
