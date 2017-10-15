import './add_user_form.html';
import { Template } from 'meteor/templating';

let userSchema = new SimpleSchema({
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    label: "E-mail address"
  },
  password: {
    type: String,
    label: "Password"
  },
  name: {
    type: String,
    label: "Name"
  }
});

/**
 * Template Helpers
 */
Template.AddUserForm.helpers({
  getUserSchema(){
    return userSchema
  }
});

/**
 * Template Event Handlers
 */
Template.AddUserForm.events({});

/**
 * Template Created
 */
Template.AddUserForm.onCreated(() => {
  let instance
});

/**
 * Template Rendered
 */
Template.AddUserForm.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AddUserForm.onDestroyed(() => {
  
});
