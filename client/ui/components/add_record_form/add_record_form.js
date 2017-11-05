import './add_record_form.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.AddRecordForm.helpers({
});

/**
 * Template Event Handlers
 */
Template.AddRecordForm.events({});

/**
 * Template Created
 */
Template.AddRecordForm.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AddRecordForm.onRendered(() => {
  let instance = Template.instance();
  
  setTimeout(() => {
    instance.$('.form-control').first().focus()
  }, 250)
});

/**
 * Template Destroyed
 */
Template.AddRecordForm.onDestroyed(() => {
  
});
