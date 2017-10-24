import './task.html';
import { Template } from 'meteor/templating';
import { Tasks } from '../../../../imports/api/tasks/tasks';

/**
 * Template Helpers
 */
Template.Task.helpers({
  task(){
    let taskId = FlowRouter.getParam('taskId');
    return Tasks.findOne(taskId)
  }
});

/**
 * Template Event Handlers
 */
Template.Task.events({});

/**
 * Template Created
 */
Template.Task.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.Task.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.Task.onDestroyed(() => {
  
});
