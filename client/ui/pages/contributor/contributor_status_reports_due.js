import './contributor_status_reports_due.html';
import { Template } from 'meteor/templating';
import { StatusReportSettings } from '../../../../imports/api/status_reports/status_report_settings';
import { StatusReports } from '../../../../imports/api/status_reports/status_reports';
import { StatusReportStates } from '../../../../imports/api/status_reports/status_report_states';

/**
 * Template Helpers
 */
Template.ContributorStatusReportsDue.helpers({
  statusReportsDue () {
    let reportsDue = [];
  
    StatusReportSettings.find({
      contributorId: this._id
    }).forEach((setting) => {
      reportsDue.push(setting);
    });
    StatusReports.find({
      contributorId: this._id,
      state        : { $ne: StatusReportStates.submitted }
    }).forEach((report) => {
      reportsDue.push(report);
    });
    
    return reportsDue.sort((a, b) => {
      let dueDateA = a.dueDate || a.nextDue,
          dueDateB = b.dueDate || b.nextDue;
      return dueDateA > dueDateB
    })
  },
  isImminentReport () {
    let dueDate = this.nextDue || this.dueDate;
    if (dueDate) {
      return dueDate - Date.now() < 24 * 60 * 60 * 1000
    }
  }
});

/**
 * Template Event Handlers
 */
Template.ContributorStatusReportsDue.events({});

/**
 * Template Created
 */
Template.ContributorStatusReportsDue.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let context = Template.currentData();
    
    instance.subscribe('contributor_incomplete_reports', context._id);
  })
});

/**
 * Template Rendered
 */
Template.ContributorStatusReportsDue.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ContributorStatusReportsDue.onDestroyed(() => {
  
});
