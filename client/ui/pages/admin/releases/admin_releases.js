import './admin_releases.html';
import { Template } from 'meteor/templating';
import { Releases } from '../../../../../imports/api/releases/releases';

/**
 * Template Helpers
 */
Template.AdminReleases.helpers({
  activeReleases () {
    return Releases.find({ isReleased: false }, { sort: { internalReleaseDate: -1, title: 1 } })
  },
  inactiveReleases () {
    return Releases.find({ isReleased: true }, { sort: { internalReleaseDate: -1, title: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.AdminReleases.events({});

/**
 * Template Created
 */
Template.AdminReleases.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminReleases.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminReleases.onDestroyed(() => {
  
});
