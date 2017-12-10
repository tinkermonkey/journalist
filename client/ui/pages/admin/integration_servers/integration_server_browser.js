import './integration_server_browser.html';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { IntegrationServers } from '../../../../../imports/api/integrations/integration_servers';
import { IntegrationTypes } from '../../../../../imports/api/integrations/integration_types';
import './integration_browser_panels/confluence_server_browser';
import './integration_browser_panels/jira_server_browser';

/**
 * Template Helpers
 */
Template.IntegrationServerBrowser.helpers({
  server () {
    let serverId = FlowRouter.getParam('serverId');
    return IntegrationServers.findOne(serverId);
  },
  integrationBrowserPanel () {
    let serverId = FlowRouter.getParam('serverId'),
        server   = IntegrationServers.findOne(serverId);
    
    switch (server.integrationType) {
      case IntegrationTypes.confluence:
        return "ConfluenceServerBrowser";
      case IntegrationTypes.jira:
        return "JiraServerBrowser";
    }
  }
});

/**
 * Template Event Handlers
 */
Template.IntegrationServerBrowser.events({});

/**
 * Template Created
 */
Template.IntegrationServerBrowser.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let serverId = FlowRouter.getParam('serverId');
    
    instance.subscribe('integration_server', serverId);
    instance.subscribe('integration_server_cache', serverId);
  })
});

/**
 * Template Rendered
 */
Template.IntegrationServerBrowser.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IntegrationServerBrowser.onDestroyed(() => {
  
});
