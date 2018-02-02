import './recent_reports.html';
import { Template } from 'meteor/templating';
import { StatusReports } from '../../../../imports/api/status_reports/status_reports';
import { StatusReportStates } from '../../../../imports/api/status_reports/status_report_states';
import '../../components/height_limited_content/height_limited_content';

let maxIncrement = 5;

/**
 * Template Helpers
 */
Template.RecentReports.helpers({
  reports () {
    let context = this,
        max     = Template.instance().max.get();
    if (context.sourceCollection && context.sourceId) {
      return StatusReports.find({
        sourceCollection: context.sourceCollection,
        sourceId        : context.sourceId,
        state           : StatusReportStates.submitted
      }, { sort: { submitDate: -1 }, limit: max })
    } else if (context._id) {
      return StatusReports.find({
        contributorId: context._id,
        state        : StatusReportStates.submitted
      }, { sort: { submitDate: -1 }, limit: max })
    }
  },
  moreReports () {
    let context = this,
        max     = Template.instance().max.get();
    if (context.sourceCollection && context.sourceId) {
      return StatusReports.find({
        sourceCollection: context.sourceCollection,
        sourceId        : context.sourceId,
        state           : StatusReportStates.submitted
      }).count() > max
    } else if (context._id) {
      return StatusReports.find({
        contributorId: context._id,
        state        : StatusReportStates.submitted
      }).count() > max
    }
  },
  canDeleteReport () {
    let currentContributor = Meteor.user().contributor();
    return currentContributor.managesContributor(this.contributorId)
  },
  showSourcePath () {
    return this.sourceCollection !== undefined && this.sourceId !== undefined
  }
});

/**
 * Template Event Handlers
 */
Template.RecentReports.events({
  "click .btn-load-more-reports" (e, instance) {
    let max = instance.max.get();
    instance.max.set(max + maxIncrement)
  },
  "click .btn-delete-report" (e, instance) {
    let reportId = $(e.target).closest(".status-report-container").attr("data-pk");
    
    RobaDialog.ask('Delete Report?', 'Are you sure that you want to delete this report?', () => {
      Meteor.call('deleteStatusReport', reportId, function (error, response) {
        if (error) {
          RobaDialog.error("Delete failed: " + error.message);
        } else {
          RobaDialog.hide();
        }
      });
    });
  },
  "click .btn-reopen-report" (e, instance) {
    let reportId = $(e.target).closest(".status-report-container").attr("data-pk");
    
    Meteor.call('reopenStatusReport', reportId, function (error, response) {
      if (error) {
        RobaDialog.error("Delete failed: " + error.message);
      }
    });
  },
});

/**
 * Template Created
 */
Template.RecentReports.onCreated(() => {
  let instance = Template.instance();
  
  instance.max = new ReactiveVar(maxIncrement);
  
  instance.autorun(() => {
    let context = Template.currentData();
    
    if (context.sourceCollection && context.sourceId) {
      instance.subscribe('recent_reports', context.sourceCollection, context.sourceId);
    } else if (context._id) {
      instance.subscribe('contributor_recent_reports', context._id);
    } else {
      console.error('RecentReports cannot determine context:', context._id);
    }
    
  });
});

/**
 * Template Rendered
 */
Template.RecentReports.onRendered(() => {
});

/**
 * Template Destroyed
 */
Template.RecentReports.onDestroyed(() => {
  
});
