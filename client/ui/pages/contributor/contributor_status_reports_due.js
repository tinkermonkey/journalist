import './contributor_status_reports_due.html';
import { Template } from 'meteor/templating';
import { StatusReportSettings } from '../../../../imports/api/status_reports/status_report_settings';

/**
 * Template Helpers
 */
Template.ContributorStatusReportsDue.helpers({
  statusReportsDue(){
    return StatusReportSettings.find({contributorId: this._id}, {sort: {nextDue: 1}})
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
