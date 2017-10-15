import './admin_users.html';
import { Template } from 'meteor/templating';
import { UserTypes } from '../../../../../imports/api/users/user_types.js';
import './admin_user_list.js';

/**
 * Template Helpers
 */
Template.AdminUsers.helpers({
  UserTypes(){
    return UserTypes;
  }
});

/**
 * Template Event Handlers
 */
Template.AdminUsers.events({});

/**
 * Template Created
 */
Template.AdminUsers.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('admin_user_list');
});

/**
 * Template Rendered
 */
Template.AdminUsers.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminUsers.onDestroyed(() => {
  
});
