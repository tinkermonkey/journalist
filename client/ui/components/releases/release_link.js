import './release_link.html';
import { Template } from 'meteor/templating';
import { Releases } from '../../../../imports/api/releases/releases';
import './release_date_summary';

/**
 * Template Helpers
 */
Template.ReleaseLink.helpers({
  release () {
    return Releases.findOne(this.releaseId)
  }
});

/**
 * Template Event Handlers
 */
Template.ReleaseLink.events({});

/**
 * Template Created
 */
Template.ReleaseLink.onCreated(() => {

});

/**
 * Template Rendered
 */
Template.ReleaseLink.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ReleaseLink.onDestroyed(() => {
  
});
