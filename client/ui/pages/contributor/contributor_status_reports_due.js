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
Template.ContributorStatusReportsDue.events({
  "click .btn-file-report" (e, instance) {
    let id       = $(e.target).closest(".status-report-breadcrumbs").attr("data-pk"),
        context  = this,
        isReport = context.state !== null;
    
    console.log('File or edit report:', id, isReport, context);
    
    if (id && isReport) {
      // Check for an existing view
      try {
        let existingViewEl = instance.$('.edit-report-form-container').get(0);
        if (existingViewEl) {
          let view = Blaze.getView(existingViewEl);
          Blaze.remove(view);
        }
      } catch (e) {
        console.error('Failed to cleanup existing EditReportForm:', e);
      }
      
      // Render the edit form to the form container
      Blaze.renderWithData(Template.EditReportForm, { reportId: id }, $('.report-form-container').get(0));
    }
  }
});

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
