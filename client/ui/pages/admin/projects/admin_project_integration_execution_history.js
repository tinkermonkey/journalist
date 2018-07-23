import './admin_project_integration_execution_history.html';
import { Template }                   from 'meteor/templating';
import { IntegrationAgentExecutions } from '../../../../../imports/api/integrations/integration_agent_executions';

/**
 * Template Helpers
 */
Template.AdminProjectIntegrationExecutionHistory.helpers({
  executions () {
    let context = this;
    
    return IntegrationAgentExecutions.find({ integrationId: context.integrationId }, { sort: { requestTime: -1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.AdminProjectIntegrationExecutionHistory.events({});

/**
 * Template Created
 */
Template.AdminProjectIntegrationExecutionHistory.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let context = Template.currentData();
    
    //console.log('AdminProjectIntegrationExecutionHistory autorun:', context);
    if (context.integrationId) {
      instance.subscribe('integration_agent_executions', context.integrationId);
    }
  })
});

/**
 * Template Rendered
 */
Template.AdminProjectIntegrationExecutionHistory.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminProjectIntegrationExecutionHistory.onDestroyed(() => {
  
});
