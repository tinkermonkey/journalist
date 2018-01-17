import './project_banner.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.ProjectBanner.helpers({
  projectBannerTemplate(){
    let project = this;
    return project.bannerTemplate || 'DevProjectBanner'
  }
});

/**
 * Template Event Handlers
 */
Template.ProjectBanner.events({});

/**
 * Template Created
 */
Template.ProjectBanner.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ProjectBanner.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ProjectBanner.onDestroyed(() => {
  
});
