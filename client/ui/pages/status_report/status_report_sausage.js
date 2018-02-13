import './status_report_sausage.html';
import { Template } from 'meteor/templating';
import { Meteor } from "meteor/meteor";
import { Users } from '../../../../imports/api/users/users';

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
  }
});

/**
 * Template Event Handlers
 */
Template.StatusReportSausage.events({});

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
