import './admin_project_home.html';
import { Template }                from 'meteor/templating';
import { RobaDialog }              from 'meteor/austinsand:roba-dialog';
import { Projects }                from '../../../../../imports/api/projects/projects';
import { IntegrationServers }      from '../../../../../imports/api/integrations/integration_servers';
import { IntegrationServerCaches } from '../../../../../imports/api/integrations/integration_server_caches';
import './admin_project_integrations';

/**
 * Template Helpers
 */
Template.AdminProjectHome.helpers({
  project () {
    let projectId = FlowRouter.getParam('projectId');
    return Projects.findOne(projectId)
  },
  integrationServers () {
    return IntegrationServers.find({}, { sort: { title: 1 } })
  },
  integrationProjectSelectorContext (server, project) {
    let cacheData = IntegrationServerCaches.findOne({ serverId: server._id, key: 'projectList' });

    return {
      valueField  : 'id',
      displayField: 'name',
      value       : (project.integrationProjects || {})[ server._id ],
      dataKey     : 'integrationProjects',
      records     : cacheData.value,
      emptyText   : 'Select a project',
      cssClass    : 'inline',
      mode        : 'popup',
      sort        : { sort: { order: 1 } },
      query       : {}
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdminProjectHome.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let projectId = $(e.target).closest('.project-container').attr('data-pk'),
        dataKey   = $(e.target).attr('data-key');
    
    if (dataKey === 'integrationProjects') {
      // get the server id
      let serverId = $(e.target).closest('.server-container').attr('data-pk'),
          value = (Projects.findOne(projectId) || {}).integrationProjects || {};

      value[serverId] = newValue;
      newValue = value;
    }
    
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
    instance.subscribe('integration_server_caches', 'projectList');
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
