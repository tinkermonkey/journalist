import './report_container.html';
import './reports.css';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.ReportContainer.helpers({
  reportTemplate () {
    //let template = PublishedDisplayTemplates.findOne(FlowRouter.getParam('templateName'));
    return FlowRouter.getParam('templateName')
  }
});

/**
 * Template Event Handlers
 */
Template.ReportContainer.events({});

/**
 * Template Created
 */
Template.ReportContainer.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ReportContainer.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ReportContainer.onDestroyed(() => {
  
});
