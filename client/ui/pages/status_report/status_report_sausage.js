import './status_report_sausage.html';
import { Template } from 'meteor/templating';
import { Meteor } from "meteor/meteor";
import { Users } from '../../../../imports/api/users/users';
import { StatusReportStates } from '../../../../imports/api/status_reports/status_report_states';

/**
 * Template Helpers
 */
Template.StatusReportSausage.helpers({
  isImminentReport () {
    let dueDate = this.nextDue || this.dueDate;
    if (dueDate) {
      return dueDate - Date.now() < 24 * 60 * 60 * 1000
    }
  },
  userControlsReport () {
    let report = this,
        user   = Users.findOne(Meteor.userId());
    
    if (user) {
      return user.contributor()._id === report.contributorId || user.contributor()
          .managesContributor(report.contributorId) || user.isAdmin()
    }
    
    return false
  },
  showSubmitButton () {
    return FlowRouter.current().route.name === 'StatusReport' && FlowRouter.getParam('reportId') === this._id && this.isOpen()
  },
  hideOpenButton () {
    return FlowRouter.current().route.name === 'StatusReport' && FlowRouter.getParam('reportId') === this._id
  }
});

/**
 * Template Event Handlers
 */
Template.StatusReportSausage.events({
  'click .btn-open-report' (e, instance) {
    let id                 = $(e.target).closest('.status-report-breadcrumbs').attr('data-pk'),
        context            = this,
        isReport           = context.state !== undefined,
        currentContributor = Meteor.user().contributor(),
        canFileReport      = context.contributorId === currentContributor._id || currentContributor.managesContributor(context.contributorId);
    
    console.log('File or edit report:', id, isReport, context);
    
    if (canFileReport) {
      if (id && isReport) {
        // Open the report page
        FlowRouter.go('StatusReport', { reportId: id });
      } else if (id) {
        console.log('File or edit report looks like it needs to create a report');
        // Create a new report
        Meteor.call('addStatusReport', currentContributor._id, context.sourceCollection, context.sourceId, StatusReportStates.inProgress, context.nextDue, (error, response) => {
          if (error) {
            RobaDialog.error('Adding report failed:' + error.toString());
          } else {
            FlowRouter.go('StatusReport', response);
          }
        });
      }
    } else {
      console.log('Doesn`t look like this user should be able to report');
    }
  },
  'click .btn-delete-report' (e, instance) {
    let reportId = $(e.target).closest('.status-report-breadcrumbs').attr('data-pk');
    
    RobaDialog.ask('Delete Report?', 'Are you sure that you want to delete this report?', () => {
      Meteor.call('deleteStatusReport', reportId, function (error, response) {
        if (error) {
          RobaDialog.error('Delete failed: ' + error.message);
        } else {
          RobaDialog.hide();
        }
      });
    });
  },
  'click .btn-reopen-report' (e, instance) {
    let reportId = $(e.target).closest('.status-report-breadcrumbs').attr('data-pk');
    
    Meteor.call('reopenStatusReport', reportId, function (error, response) {
      if (error) {
        RobaDialog.error('Re-open failed: ' + error.message);
      }
    });
  },
  'click .btn-submit-report' (e, instance) {
    let reportId = $(e.target).closest('.status-report-breadcrumbs').attr('data-pk');
    
    if (reportId) {
      Meteor.call('submitStatusReport', reportId, function (error, response) {
        if (error) {
          RobaDialog.error('Submit failed: ' + error.message);
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.StatusReportSausage.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.StatusReportSausage.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.StatusReportSausage.onDestroyed(() => {
  
});
