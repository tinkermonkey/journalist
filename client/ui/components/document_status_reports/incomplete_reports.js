import './incomplete_reports.html';
import { Template }           from 'meteor/templating';
import { RobaDialog }         from 'meteor/austinsand:roba-dialog';
import { StatusReports }      from '../../../../imports/api/status_reports/status_reports';
import { StatusReportStates } from '../../../../imports/api/status_reports/status_report_states';
import './edit_report_form';

/**
 * Template Helpers
 */
Template.IncompleteReports.helpers({
  reports () {
    let context         = this,
        contributor     = Meteor.user().contributor(),
        contributorList = contributor.allStaffIds();
    
    contributorList.push(contributor._id);
    
    if (context.sourceCollection && context.sourceId) {
      return StatusReports.find({
        sourceCollection: context.sourceCollection,
        sourceId        : context.sourceId,
        contributorId   : { $in: contributorList },
        state           : { $ne: StatusReportStates.submitted }
      }, { sort: { dateCreated: -1 } })
    }
  }
});

/**
 * Template Event Handlers
 */
Template.IncompleteReports.events({
  'click .btn-edit-report' (e, instance) {
    let reportId = $(e.target).closest('.data-table-row').attr('data-pk');
    
    if (reportId) {
      // Render the edit form to the form container
      Blaze.renderWithData(Template.EditReportForm, { reportId: reportId }, $('.report-form-container').get(0));
    }
  },
  'click .btn-delete-report' (e, instance) {
    let reportId = $(e.target).closest('.data-table-row').attr('data-pk');
    
    RobaDialog.ask('Delete Report?', 'Are you sure that you want to delete this report?', () => {
      Meteor.call('deleteStatusReport', reportId, function (error, response) {
        if (error) {
          RobaDialog.error('Delete failed: ' + error.message);
        } else {
          RobaDialog.hide();
        }
      });
    });
  }
});

/**
 * Template Created
 */
Template.IncompleteReports.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let context = Template.currentData();
    
    if (context.sourceCollection && context.sourceId) {
      instance.subscribe('incomplete_reports', context.sourceCollection, context.sourceId);
    } else if (context._id) {
      instance.subscribe('contributor_incomplete_reports', context._id);
    } else {
      console.error('IncompleteReports cannot determine context:', context._id);
    }
  });
});

/**
 * Template Rendered
 */
Template.IncompleteReports.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IncompleteReports.onDestroyed(() => {
  
});
