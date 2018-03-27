import './admin_release.html';
import { Template } from 'meteor/templating';
import { Releases}  from '../../../../../imports/api/releases/releases';

/**
 * Template Helpers
 */
Template.AdminRelease.helpers({
  release(){
    let releaseId = FlowRouter.getParam('releaseId');
    return Releases.findOne(releaseId)
  }
});

/**
 * Template Event Handlers
 */
Template.AdminRelease.events({});

/**
 * Template Created
 */
Template.AdminRelease.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminRelease.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminRelease.onDestroyed(() => {
  
});
