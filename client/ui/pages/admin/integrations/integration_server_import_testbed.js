import './integration_server_import_testbed.html';
import { Template } from 'meteor/templating';
import { IntegrationTypes } from '../../../../../imports/api/integrations/integration_types';
import { IntegrationServers } from '../../../../../imports/api/integrations/integration_servers';
import './integration_browser_panels/jira_import_testbed';
import './integration_browser_panels/confluence_import_testbed';

/**
 * Template Helpers
 */
Template.IntegrationServerImportTestbed.helpers({
  integrationImportTestbedPanel () {
    let context = this.context,
        integrationType;
  
    if (context && context.integrationType != null) {
      integrationType = context.integrationType;
    } else if (context && context.serverId) {
      let server      = IntegrationServers.findOne(context.serverId);
      integrationType = server && server.integrationType;
    }
    
    switch (integrationType) {
      case IntegrationTypes.confluence:
        return "ConfluenceImportTestbed";
      case IntegrationTypes.jira:
        return "JiraImportTestbed";
    }
  }
});

/**
 * Template Event Handlers
 */
Template.IntegrationServerImportTestbed.events({});

/**
 * Template Created
 */
Template.IntegrationServerImportTestbed.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('integration_servers');
});

/**
 * Template Rendered
 */
Template.IntegrationServerImportTestbed.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IntegrationServerImportTestbed.onDestroyed(() => {
  
});
