import { Template } from 'meteor/templating';
import './status_bar.html';
import './status_bar.css';
import './status_circle.js';

/**
 * Template Helpers
 */
Template.StatusBar.helpers({
  getCircleClass(){
    if (this.status === false) {
      return 'fail'
    } else if (this.status === true) {
      return 'pass'
    } else {
      return this.status;
    }
  }
});

/**
 * Template Event Handlers
 */
Template.StatusBar.events({});

/**
 * Template Created
 */
Template.StatusBar.created = function () {

};

/**
 * Template Rendered
 */
Template.StatusBar.rendered = function () {

};

/**
 * Template Destroyed
 */
Template.StatusBar.destroyed = function () {

};
