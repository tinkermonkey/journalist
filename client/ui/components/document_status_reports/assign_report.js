import './assign_report.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.AssignReport.helpers({
  showForm(){
    return Template.instance().showForm.get();
  }
});

/**
 * Template Event Handlers
 */
Template.AssignReport.events({
  "click .btn-assign-report"(e, instance){
    let context = instance.data;
    
    if(context.sourceCollection && context.sourceId){
      // Show a form to select a date and contributor
      
    }
  }
});

/**
 * Template Created
 */
Template.AssignReport.onCreated(() => {
  let instance = Template.instance();
  
  instance.showForm = new ReactiveVar(false);
});

/**
 * Template Rendered
 */
Template.AssignReport.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AssignReport.onDestroyed(() => {
  
});
