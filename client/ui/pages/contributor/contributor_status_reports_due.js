import './contributor_status_reports_due.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { StatusReportSettings } from '../../../../imports/api/status_reports/status_report_settings';
import { StatusReports } from '../../../../imports/api/status_reports/status_reports';
import { StatusReportStates } from '../../../../imports/api/status_reports/status_report_states';
import '../status_report/status_report_sausage';

/**
 * Template Helpers
 */
Template.ContributorStatusReportsDue.helpers({
  statusReportsDue () {
    let reportsDue = [];
    
    // Cross reference the non-submitted reports
    StatusReports.find({
      contributorId: this._id,
      state        : { $ne: StatusReportStates.submitted }
    }).forEach((report) => {
      reportsDue.push(report);
    });
    
    // Get all of the scheduled reports
    StatusReportSettings.find({
      contributorId: this._id
    }).forEach((setting) => {
      if (!reportsDue.find((item) => {
            return item.sourceCollection === setting.sourceCollection && item.sourceId === setting.sourceId
          })) {
        reportsDue.push(setting);
      }
    });
    
    // Sort by due date
    return reportsDue
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
  });
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
