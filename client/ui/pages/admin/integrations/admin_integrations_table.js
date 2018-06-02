import './admin_integrations_table.html';
import { Template }        from 'meteor/templating';
import { IntegrationTypes} from '../../../../../imports/api/integrations/integration_types';
import './panels/jira_integration_detail_column';

/**
 * Template Helpers
 */
Template.AdminIntegrationsTable.helpers({
  integrationDetailColumn () {
    switch (this.server().integrationType) {
      case IntegrationTypes.jira:
        return 'JiraIntegrationDetailColumn'
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdminIntegrationsTable.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let integrationId = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey       = $(e.target).attr('data-key');
    
    console.log('AdminIntegrationsTable edited:', integrationId, dataKey, newValue);
    if (integrationId !== null && dataKey !== null) {
      // Create the project
      Meteor.call('editIntegration', integrationId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Failed to edit project integration:' + error.toString())
        }
      });
    }
  },
});

/**
 * Template Created
 */
Template.AdminIntegrationsTable.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminIntegrationsTable.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminIntegrationsTable.onDestroyed(() => {
  
});
