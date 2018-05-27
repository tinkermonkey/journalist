import './release.html';
import { Template } from 'meteor/templating';
import { Releases } from '../../../../imports/api/releases/releases';
import '../../components/releases/default_release_contents';

/**
 * Template Helpers
 */
Template.Release.helpers({
  release () {
    let releaseId = Template.instance().releaseId.get();
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
  let instance = Template.instance();
  
  instance.releaseId = new ReactiveVar();
  
  instance.autorun(() => {
    let paramReleaseId = FlowRouter.getParam('releaseId'),
        dataReleaseId  = Template.currentData().toString();
    
    instance.releaseId.set(paramReleaseId || dataReleaseId);
  })
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
