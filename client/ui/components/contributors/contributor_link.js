import './contributor_link.html';
import { Template }     from 'meteor/templating';
import { Contributors } from '../../../../imports/api/contributors/contributors';

/**
 * Template Helpers
 */
Template.ContributorLink.helpers({
  contributor () {
    let contributorId = this.toString();
    return Contributors.findOne(contributorId);
  }
});

/**
 * Template Event Handlers
 */
Template.ContributorLink.events({});

/**
 * Template Created
 */
Template.ContributorLink.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ContributorLink.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ContributorLink.onDestroyed(() => {
  
});
