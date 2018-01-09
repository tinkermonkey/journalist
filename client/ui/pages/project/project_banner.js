import './project_banner.html';
import { Template } from 'meteor/templating';
import './project_banners/support_project_banner';

/**
 * Template Helpers
 */
Template.ProjectBanner.helpers({
  projectBannerTemplate(){
    let project = this;
    switch (project.homeBanner){
      default:
        return 'SupportProjectBanner'
    }
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
