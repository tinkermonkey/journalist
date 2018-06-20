import './add_report_form.html';
import { Template }     from 'meteor/templating';
import { Random }       from 'meteor/random';
import SimpleSchema     from 'simpl-schema';
import { Contributors } from '../../../../imports/api/contributors/contributors.js';

let schema = new SimpleSchema({
  contributorId: {
    type: String
  },
  dueDate      : {
    type : Date,
    label: 'Due Date'
  }
});

/**
 * Template Helpers
 */
Template.AddReportForm.helpers({
  getSchema () {
    return schema
  },
  contributorOptions () {
    return Contributors.find({}, { sort: { name: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.AddReportForm.events({
  'submit form' (e, instance) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

/**
 * Template Created
 */
Template.AddReportForm.onCreated(() => {
  let instance = Template.instance();
  
  instance.formId = Random.id();
});

/**
 * Template Rendered
 */
Template.AddReportForm.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AddReportForm.onDestroyed(() => {
  
});
