import './effort.html';
import { Template } from 'meteor/templating';
import { Efforts } from '../../../../imports/api/efforts/efforts';

/**
 * Template Helpers
 */
Template.Effort.helpers({
  effort(){
    let effortId = FlowRouter.getParam('effortId');
    return Efforts.findOne(effortId)
  }
});

/**
 * Template Event Handlers
 */
Template.Effort.events({});

/**
 * Template Created
 */
Template.Effort.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.Effort.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.Effort.onDestroyed(() => {
  
});
