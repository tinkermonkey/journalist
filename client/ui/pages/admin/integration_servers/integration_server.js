import './integration_server.html';
import { Template }           from 'meteor/templating';
import { FlowRouter }         from 'meteor/kadira:flow-router';
import { IntegrationServers } from '../../../../../imports/api/integrations/integration_servers';
import { IntegrationTypes }   from '../../../../../imports/api/integrations/integration_types';
import './integration_server_panels/confluence_server';
import './integration_server_panels/jira_server';
import './integration_server_auth_provider';
import '../../../components/misc/authenticate_server_link';

/**
 * Template Helpers
 */
Template.IntegrationServer.helpers({
  server () {
    let serverId = FlowRouter.getParam('serverId');
    return IntegrationServers.findOne(serverId);
  },
  integrationServerPanel () {
    let serverId = FlowRouter.getParam('serverId'),
        server   = IntegrationServers.findOne(serverId);
    
    switch (server.integrationType) {
      case IntegrationTypes.confluence:
        return 'ConfluenceServer';
      case IntegrationTypes.jira:
        return 'JiraServer';
    }
  }
});

/**
 * Template Event Handlers
 */
Template.IntegrationServer.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let serverId = FlowRouter.getParam('serverId'),
        dataKey  = $(e.target).attr('data-key');
    
    if (serverId && dataKey) {
      Meteor.call('editIntegrationServer', serverId, dataKey, newValue, (error, response) => {
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
Template.IntegrationServer.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let serverId = FlowRouter.getParam('serverId');
    
    instance.subscribe('integration_server', serverId);
    instance.subscribe('integration_server_cache', serverId);
    instance.subscribe('integration_server_auth_providers', serverId);
  })
});

/**
 * Template Rendered
 */
Template.IntegrationServer.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IntegrationServer.onDestroyed(() => {
  
});
