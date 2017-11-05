import './recent_reports.html';
import { Template } from 'meteor/templating';
import { StatusReports } from '../../../../imports/api/status_reports/status_reports';
import { StatusReportStates } from '../../../../imports/api/status_reports/status_report_states';

let maxIncrement = 5;

/**
 * Template Helpers
 */
Template.RecentReports.helpers({
  reports(){
    let context = this,
        max     = Template.instance().max.get();
    if (context.sourceCollection && context.sourceId) {
      return StatusReports.find({
        sourceCollection: context.sourceCollection,
        sourceId        : context.sourceId,
        state           : StatusReportStates.submitted
      }, { sort: { submitDate: -1 }, limit: max })
    }
  },
  moreReports(){
    let context = this,
        max     = Template.instance().max.get();
    if (context.sourceCollection && context.sourceId) {
      return StatusReports.find({
            sourceCollection: context.sourceCollection,
            sourceId        : context.sourceId,
            state           : StatusReportStates.submitted
          }).count() > max
    }
  },
  canDeleteReport(){
    let currentContributor = Meteor.user().contributor();
    return currentContributor.managesContributor(this.contributorId)
  }
});

/**
 * Template Event Handlers
 */
Template.RecentReports.events({
  "click .btn-load-more-reports"(e, instance){
    let max = instance.max.get();
    instance.max.set(max + maxIncrement)
  },
  "click .btn-delete-report"(e, instance){
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
  "click .btn-reopen-report"(e, instance){
    let reportId = $(e.target).closest(".status-report-container").attr("data-pk");
    
    Meteor.call('reopenStatusReport', reportId, function (error, response) {
      if (error) {
        RobaDialog.error("Delete failed: " + error.message);
      }
    });
  }
});

/**
 * Template Created
 */
Template.RecentReports.onCreated(() => {
  let instance = Template.instance();
  
  instance.max = new ReactiveVar(maxIncrement);
  
  instance.autorun(() => {
    let context = Template.currentData();
    
    instance.subscribe('recent_reports', context.sourceCollection, context.sourceId);
  });
});

/**
 * Template Rendered
 */
Template.RecentReports.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let context = Template.currentData(),
        max     = instance.max.get(),
        reports = StatusReports.find({
          sourceCollection: context.sourceCollection,
          sourceId        : context.sourceId,
          state           : StatusReportStates.submitted
        }, { sort: { submitDate: -1 }, limit: max });
    
    if (reports.count()) {
      clearTimeout(instance.heightCheckTimeout);
      instance.heightCheckTimeout = setTimeout(() => {
        instance.$(".status-report-body").each(function () {
          let outerHeight = $(this).innerHeight(),
              innerHeight = $(this).find(".status-report-body-inner").innerHeight();
          
          if (Math.abs(innerHeight - outerHeight) < 50) {
            $(this).removeClass('collapsed');
          }
        })
      }, 500);
    }
  });
});

/**
 * Template Destroyed
 */
Template.RecentReports.onDestroyed(() => {
  
});
