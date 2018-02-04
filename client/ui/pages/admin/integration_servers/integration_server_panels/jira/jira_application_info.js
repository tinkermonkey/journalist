import './jira_application_info.html';
import { Template } from 'meteor/templating';
import './jira_brain_dump';

/**
 * Template Helpers
 */
Template.JiraApplicationInfo.helpers({
  serverInfoPayload () {
    return { doHealthCheck: false }
  }
});

/**
 * Template Event Handlers
 */
Template.JiraApplicationInfo.events({});

/**
 * Template Created
 */
Template.JiraApplicationInfo.onCreated(() => {
});

/**
 * Template Rendered
 */
Template.JiraApplicationInfo.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.JiraApplicationInfo.onDestroyed(() => {
  
});
