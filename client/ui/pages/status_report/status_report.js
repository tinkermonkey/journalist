import './status_report.html';
import { Template } from 'meteor/templating';
import { StatusReports } from '../../../../imports/api/status_reports/status_reports';

/**
 * Template Helpers
 */
Template.StatusReport.helpers({
  statusReport () {
    let reportId = FlowRouter.getParam('reportId');
    return StatusReports.findOne(reportId)
  }
});

/**
 * Template Event Handlers
 */
Template.StatusReport.events({});

/**
 * Template Created
 */
Template.StatusReport.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let reportId = FlowRouter.getParam('reportId');
    
    instance.subscribe('status_report', reportId);
  })
});

/**
 * Template Rendered
 */
Template.StatusReport.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.StatusReport.onDestroyed(() => {
  
});
