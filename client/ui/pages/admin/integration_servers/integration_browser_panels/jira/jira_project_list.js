import './jira_project_list.html';
import { Template } from 'meteor/templating';
import '../../../../../components/misc/json_info_link';

/**
 * Template Helpers
 */
Template.JiraProjectList.helpers({
  projects () {
    return Template.instance().projects.get();
  },
  showLoading () {
    return Template.instance().showLoading.get();
  },
  error () {
    return Template.instance().error.get();
  },
  getProjectAvatarUrl () {
    let project = this;
    
    return this.avatarUrls && this.avatarUrls[ '16x16' ]
  }
});

/**
 * Template Event Handlers
 */
Template.JiraProjectList.events({
  'click .btn-refresh' (e, instance) {
    instance.doorbell.set(Date.now());
  }
});

/**
 * Template Created
 */
Template.JiraProjectList.onCreated(() => {
  let instance = Template.instance();
  
  instance.projects    = new ReactiveVar([]);
  instance.doorbell    = new ReactiveVar(Date.now());
  instance.error       = new ReactiveVar();
  instance.showLoading = new ReactiveVar(true);
  
  instance.autorun(() => {
    let serverId = FlowRouter.getParam('serverId'),
        doorBell = instance.doorbell.get();
    
    // Fetch the project list
    console.log('JiraProjectList fetching project list for', serverId, doorBell);
    instance.showLoading.set(true);
    Meteor.call('fetchIntegrationServerData', serverId, { module: 'project', method: 'getAllProjects' }, (error, response) => {
      instance.showLoading.set(false);
      if (error) {
        console.error('getAllProjects failed:', error);
        instance.error.set(error);
        instance.projects.set([]);
      } else {
        instance.error.set();
        instance.projects.set(_.sortBy(response, 'name'));
      }
    });
  })
});

/**
 * Template Rendered
 */
Template.JiraProjectList.onRendered(() => {

});

/**
 * Template Destroyed
 */
Template.JiraProjectList.onDestroyed(() => {
  
});
