import './admin_project_home.html';
import { Template } from 'meteor/templating';
import { Projects } from '../../../../../imports/api/projects/projects';
import './admin_project_integrations';

/**
 * Template Helpers
 */
Template.AdminProjectHome.helpers({
  project(){
    let projectId = FlowRouter.getParam('projectId');
    return Projects.findOne(projectId)
  }
});

/**
 * Template Event Handlers
 */
Template.AdminProjectHome.events({
  "edited .editable"(e, instance, newValue){
    e.stopImmediatePropagation();
    
    let projectId = $(e.target).closest(".project-container").attr("data-pk"),
        dataKey   = $(e.target).attr("data-key");
    
    console.log('edited:', projectId, dataKey, newValue);
    if (projectId && dataKey) {
      Meteor.call('editProject', projectId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.AdminProjectHome.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let projectId = FlowRouter.getParam('projectId');
    
    instance.subscribe('integrations', projectId);
  });
});

/**
 * Template Rendered
 */
Template.AdminProjectHome.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminProjectHome.onDestroyed(() => {
  
});
