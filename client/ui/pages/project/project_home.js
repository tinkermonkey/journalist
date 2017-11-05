import './project_home.html';
import { Template } from 'meteor/templating';
import { Projects } from '../../../../imports/api/projects/projects';
import './project_banner.js';
import './project_header.js';
import './project_sidebar.js';

/**
 * Template Helpers
 */
Template.ProjectHome.helpers({
  project(){
    let projectId = FlowRouter.getParam('projectId');
    return Projects.findOne(projectId)
  }
});

/**
 * Template Event Handlers
 */
Template.ProjectHome.events({});

/**
 * Template Created
 */
Template.ProjectHome.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ProjectHome.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ProjectHome.onDestroyed(() => {
  
});
