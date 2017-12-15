import './admin_project_integration.html';
import { Template } from 'meteor/templating';
import { Integrations } from '../../../../../imports/api/integrations/integrations';
import { IntegrationTypes } from '../../../../../imports/api/integrations/integration_types';
import './panels/jira_integration_panel';
import '../integrations/integration_server_field_reference';

/**
 * Template Helpers
 */
Template.AdminProjectIntegration.helpers({
  integration () {
    let integrationId = FlowRouter.getParam('integrationId');
    return Integrations.findOne({ _id: integrationId })
  },
  integrationPanel () {
    switch (this.integrationType) {
      case IntegrationTypes.jira:
        return 'JiraIntegrationPanel';
      case IntegrationTypes.confluence:
        return 'ConfluenceIntegrationPanel'
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdminProjectIntegration.events({});

/**
 * Template Created
 */
Template.AdminProjectIntegration.onCreated(() => {
  console.log('AdminProjectIntegration onCreated');
  let instance = Template.instance();
  
  instance.subscribe('integration_display_templates');
  instance.subscribe('integration_import_functions');
  instance.subscribe('integration_calculated_fields');
  
  instance.autorun(() => {
    let integrationId = FlowRouter.getParam('integrationId');
    
    instance.subscribe('integration', integrationId);
  })
});

/**
 * Template Rendered
 */
Template.AdminProjectIntegration.onRendered(() => {
  console.log('AdminProjectIntegration onRendered');
});

/**
 * Template Destroyed
 */
Template.AdminProjectIntegration.onDestroyed(() => {
  
});
