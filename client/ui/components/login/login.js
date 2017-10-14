import './login.html';
import './login.css';

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Accounts } from 'meteor/accounts-base';

/**
 * Template Helpers
 */
Template.Login.helpers({

});

/**
 * Template Event Handlers
 */
Template.Login.events({
  'submit .login-form'(e, instance) {
    console.log("Login form submitted:", e.target);
    let username = instance.$(".login-username").val(),
        password = instance.$(".login-password").val();
    
    if(username && password && e.target.checkValidity()){
      // full authentication
      console.log("Logging in with password");
      Meteor.loginWithPassword(username, password, function (error, response) {
        if(error){
          console.error("Login error: ", error);
          instance.$(".login-error").text(error.message);
          if(error.error === 403){
            instance.$(".btn-sign-up").removeClass("hide");
          }
        } else {
          console.log("Login successful: ", response, Meteor.userId());
          if(Meteor.userId()){
            // FlowRouter should handle navigating elsewhere
          } else {
            console.error("After login, userId is still null");
          }
        }
      });
    } else {
      instance.$(".login-error").text("go on, type it in");
    }
    return false;
  },
  'keyup .login-username, keyup .login-password'(e, instance) {
    if(e.which === 13 || e.keyCode === 13) {
      instance.$(".login-form").submit();
    }
  },
  'click .btn-sign-up'(e, instance) {
    let username = instance.$(".login-username").val(),
        password = instance.$(".login-password").val();
    
    if(username && password) {
      console.log("Signing-up in with password");
      Accounts.createUser({
        username: username,
        email: username,
        password: password
      }, function (error) {
        if(error){
          instance.$(".login-error").text(error.message);
        } else {
          console.log("Account Created");
        }
      })
      
    }
  }
});

/**
 * Template Created
 */
Template.Login.onCreated( function () {

});

/**
 * Template Rendered
 */
Template.Login.onRendered( function () {
  let instance = Template.instance();
  setTimeout(() => {
    instance.$(".login-username").focus();
  }, 250);
});

/**
 * Template Destroyed
 */
Template.Login.onDestroyed( function () {

});
