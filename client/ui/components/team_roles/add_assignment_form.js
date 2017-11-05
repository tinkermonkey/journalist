import './add_assignment_form.html';
import { Template } from 'meteor/templating';
import { Projects } from '../../../../imports/api/projects/projects';

let assignmentSchema = new SimpleSchema({
  projectId: {
    type : String,
    label: "Project"
  },
  percent  : {
    type : Number,
    label: "Percent"
  }
});

/**
 * Template Helpers
 */
Template.AddAssignmentForm.helpers({
  getSchema () {
    return assignmentSchema
  },
  projectOptions () {
    return Projects.find({}, { sort: { title: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.AddAssignmentForm.events({});

/**
 * Template Created
 */
Template.AddAssignmentForm.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AddAssignmentForm.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AddAssignmentForm.onDestroyed(() => {
  
});
