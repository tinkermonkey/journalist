import './add_record_form.html';
import { Template } from 'meteor/templating';
import { Random }   from 'meteor/random';
import { AutoForm } from 'meteor/aldeed:autoform';

/**
 * Template Helpers
 */
Template.AddRecordForm.helpers({
});

/**
 * Template Event Handlers
 */
Template.AddRecordForm.events({
  'submit form'(e, instance){
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

/**
 * Template Created
 */
Template.AddRecordForm.onCreated(() => {
  let instance = Template.instance();
  
  instance.formId = Random.id();
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
