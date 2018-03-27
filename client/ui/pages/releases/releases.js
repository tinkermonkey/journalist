import './releases.html';
import { Template }             from 'meteor/templating';
import { CapacityPlanReleases } from '../../../../imports/api/capacity_plans/capacity_plan_releases';

/**
 * Template Helpers
 */
Template.Releases.helpers({
  activeReleases () {
    return CapacityPlanReleases.find({ isReleased: false }, { sort: { internalReleaseDate: -1, title: 1 } })
  },
  releasedReleases () {
    return CapacityPlanReleases.find({ isReleased: true }, { sort: { internalReleaseDate: -1, title: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.Releases.events({});

/**
 * Template Created
 */
Template.Releases.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.Releases.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.Releases.onDestroyed(() => {
  
});
