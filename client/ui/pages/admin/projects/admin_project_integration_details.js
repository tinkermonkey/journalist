import './admin_project_integration_details.html';
import { Template }         from 'meteor/templating';
import { IntegrationTypes } from '../../../../../imports/api/integrations/integration_types';
import './panels/jira_integration_detail_panel';
import './panels/confluence_integration_detail_panel';

/**
 * Template Helpers
 */
Template.AdminProjectIntegrationDetails.helpers({
  integrationPanel () {
    let integration = this;
    switch (integration.server().integrationType) {
      case IntegrationTypes.jira:
        return 'JiraIntegrationDetailPanel';
      case IntegrationTypes.confluence:
        return 'ConfluenceIntegrationDetailPanel'
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdminProjectIntegrationDetails.events({});

/**
 * Template Created
 */
Template.AdminProjectIntegrationDetails.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminProjectIntegrationDetails.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminProjectIntegrationDetails.onDestroyed(() => {
  
});
