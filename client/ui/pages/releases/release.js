import './release.html';
import { Template } from 'meteor/templating';
import { Releases } from '../../../../imports/api/releases/releases';

/**
 * Template Helpers
 */
Template.Release.helpers({
  release(){
    let releaseId = FlowRouter.getParam('releaseId');
    return Releases.findOne(releaseId)
  }
});

/**
 * Template Event Handlers
 */
Template.Release.events({});

/**
 * Template Created
 */
Template.Release.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.Release.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.Release.onDestroyed(() => {
  
});
