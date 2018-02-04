import './status_reports_due.html';
import { Template }             from 'meteor/templating';
import { StatusReportSettings } from '../../../../imports/api/status_reports/status_report_settings';
import { StatusReports }        from '../../../../imports/api/status_reports/status_reports';
import { StatusReportStates }   from '../../../../imports/api/status_reports/status_report_states';

/**
 * Template Helpers
 */
Template.StatusReportsDue.helpers({
  statusReportsDue () {
    let reportsDue = [];
    
    // Get all of the scheduled reports
    StatusReportSettings.find({
      contributorId: this._id
    }).forEach((setting) => {
      reportsDue.push(setting);
    });
    
    // Cross reference the non-submitted reports
    StatusReports.find({
      contributorId: this._id,
      state        : { $ne: StatusReportStates.submitted }
    }).forEach((report) => {
      reportsDue.push(report);
    });
    
    // Sort by due date
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
Template.StatusReportsDue.events({});

/**
 * Template Created
 */
Template.StatusReportsDue.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let context = Template.currentData();
    
    instance.subscribe('contributor_incomplete_reports', context._id);
  })
});

/**
 * Template Rendered
 */
Template.StatusReportsDue.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.StatusReportsDue.onDestroyed(() => {
  
});
