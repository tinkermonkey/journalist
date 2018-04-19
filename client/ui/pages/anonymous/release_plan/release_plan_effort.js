import './release_plan_effort.html';
import { Template } from 'meteor/templating';
import './release_plan_effort_overlay';

/**
 * Template Helpers
 */
Template.ReleasePlanEffort.helpers({
  multipleContributors(){
    return this.count > 1
  },
  previewTemplate(){
    return Template.ReleasePlanEffortOverlay
  }
});

/**
 * Template Event Handlers
 */
Template.ReleasePlanEffort.events({});

/**
 * Template Created
 */
Template.ReleasePlanEffort.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ReleasePlanEffort.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ReleasePlanEffort.onDestroyed(() => {
  
});
