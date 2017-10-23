import './contributor_home.html';
import './contributor_home.css';
import { Template } from 'meteor/templating';
import { Contributors } from '../../../../imports/api/contributors/contributors';
import './contributor_sidebar.js';
import './contributor_banner.js';
import './contributor_header.js';

/**
 * Template Helpers
 */
Template.ContributorHome.helpers({
  contributor(){
    let contributorId = FlowRouter.getParam('contributorId');
    if(contributorId){
      return Contributors.findOne(contributorId)
    } else {
      return Meteor.user().contributor()
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
