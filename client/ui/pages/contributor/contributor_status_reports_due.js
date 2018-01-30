import './contributor_status_reports_due.html';
import { Template } from 'meteor/templating';
import { StatusReportSettings } from '../../../../imports/api/status_reports/status_report_settings';
import { StatusReports } from '../../../../imports/api/status_reports/status_reports';
import { StatusReportStates } from '../../../../imports/api/status_reports/status_report_states';

/**
 * Template Helpers
 */
Template.ContributorStatusReportsDue.helpers({
  statusReportsDue() {
    let reportsDue = [];

    // Cross reference the non-submitted reports
    StatusReports.find({
      contributorId: this._id,
      state: { $ne: StatusReportStates.submitted }
    }).forEach((report) => {
      reportsDue.push(report);
    });

    // Get all of the scheduled reports
    StatusReportSettings.find({
      contributorId: this._id
    }).forEach((setting) => {
      if (!reportsDue.find((item) => { return item.sourceCollection === setting.sourceCollection && item.sourceId === setting.sourceId })) {
        reportsDue.push(setting);
      }
    });

    // Sort by due date
    return reportsDue
  },
  isImminentReport() {
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
  "click .btn-file-report"(e, instance) {
    let id = $(e.target).closest(".status-report-breadcrumbs").attr("data-pk"),
      context = this,
      isReport = context.state !== undefined,
      currentContributor = Meteor.user().contributor(),
      canFileReport = context.contributorId === currentContributor._id || currentContributor.managesContributor(context.contributorId);


    console.log('File or edit report:', id, isReport, context);

    if (canFileReport) {
      if (id && isReport) {
        console.log('File or edit report looks like an existing report');
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
        console.log($('.report-form-container').get(0));
        Blaze.renderWithData(Template.EditReportForm, { reportId: id }, $('.report-form-container').get(0));
      } else if (id) {
        console.log('File or edit report looks like it needs to create a report');
        // Create a new report
        Meteor.call('addStatusReport', currentContributor._id, context.sourceCollection, context.sourceId, StatusReportStates.inProgress, context.nextDue, (error, response) => {
          if (error) {
            RobaDialog.error('Adding report failed:' + error.toString());
          } else {
            // Hide the File Report link
            instance.$('.btn-file-report').hide();

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
            Blaze.renderWithData(Template.EditReportForm, { reportId: response.reportId }, instance.$('.report-form-container').get(0))
          }
        });
      }
    } else {
      console.log('Doesn`t look like this user should be able to report');
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
