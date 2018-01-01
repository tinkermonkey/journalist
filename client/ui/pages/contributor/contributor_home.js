import './contributor_home.html';
import './contributor_home.css';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Contributors } from '../../../../imports/api/contributors/contributors';
import { Users } from '../../../../imports/api/users/users';
import './contributor_sidebar.js';
import './contributor_banner.js';
import './contributor_header.js';
import './contributor_status_reports_due.js';
import '../../components/document_status_reports/document_status_reports.js';
import './contributor_items.js';

/**
 * Template Helpers
 */
Template.ContributorHome.helpers({
  contributor () {
    let contributorId = FlowRouter.getParam('contributorId');
    if (contributorId) {
      return Contributors.findOne(contributorId)
    } else {
      return Meteor.user().contributor()
    }
  },
  shouldSeeReports () {
    let contributor = this,
        user        = Users.findOne(Meteor.userId());
    if (user) {
      return user.contributor()._id === contributor._id || user.managesContributor(contributor._id) || user.isAdmin();
    }
  }
});

/**
 * Template Event Handlers
 */
Template.ContributorHome.events({});

/**
 * Template Created
 */
Template.ContributorHome.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ContributorHome.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ContributorHome.onDestroyed(() => {
  
});
