import './report_container.html';
import './reports.css';
import { Template } from 'meteor/templating';
import { PublishedDisplayTemplates } from '../../../../imports/api/display_templates/published_display_templates';

/**
 * Template Helpers
 */
Template.ReportContainer.helpers({
  reportTemplate(){
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
