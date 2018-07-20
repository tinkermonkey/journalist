import './release_dashboard.html';
import './release_dashboard.css';
import { Template }               from 'meteor/templating';
import { Releases}                from '../../../../../imports/api/releases/releases';
import { ReleaseIntegrationLinks } from '../../../../../imports/api/releases/release_integration_links';
import '../../releases/releases';

/**
 * Template Helpers
 */
Template.ReleaseDashboard.helpers({});

/**
 * Template Event Handlers
 */
Template.ReleaseDashboard.events({});

/**
 * Template Created
 */
Template.ReleaseDashboard.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('releases');
  instance.subscribe('release_integration_links');
  
  instance.autorun(() => {
    console.log("ReleaseDashboard Releases:", Releases.find().fetch());
    console.log("ReleaseDashboard release_integration_links:", ReleaseIntegrationLinks.find().fetch());
  })
});

/**
 * Template Rendered
 */
Template.ReleaseDashboard.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ReleaseDashboard.onDestroyed(() => {
  
});
