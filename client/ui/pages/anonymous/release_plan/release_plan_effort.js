import './release_plan_effort.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.ReleasePlanEffort.helpers({
  multipleContributors(){
    return this.count > 1
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
