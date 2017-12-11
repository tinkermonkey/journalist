import './login_server_form.html';
import { Template } from 'meteor/templating';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

let schema = new SimpleSchema({
  username: {
    type: String
  },
  password: {
    type: String
  }
});

/**
 * Template Helpers
 */
Template.LoginServerForm.helpers({});

/**
 * Template Event Handlers
 */
Template.LoginServerForm.events({});

/**
 * Template Created
 */
Template.LoginServerForm.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.LoginServerForm.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.LoginServerForm.onDestroyed(() => {
  
});
