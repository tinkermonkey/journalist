import './admin_project_integration.html';
import { Template } from 'meteor/templating';
import { Integrations } from '../../../../../imports/api/integrations/integrations';
import './admin_project_integration_details';
import '../integrations/integration_server_field_reference';
import '../integrations/integration_server_import_testbed';

/**
 * Template Helpers
 */
Template.AdminProjectIntegration.helpers({
  integration () {
    let integrationId = FlowRouter.getParam('integrationId');
    return Integrations.findOne({ _id: integrationId })
  }
});

/**
 * Template Event Handlers
 */
Template.AdminProjectIntegration.events({
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let integrationId = FlowRouter.getParam('integrationId'),
        dataKey       = $(e.target).attr("data-key");
    
    console.log('AdminProjectIntegration edited:', integrationId, dataKey, newValue);
    if (integrationId !== null && dataKey !== null) {
      // Create the project
      Meteor.call('editIntegration', integrationId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Failed to edit project integration:' + error.toString())
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.AdminProjectIntegration.onCreated(() => {
  console.log('AdminProjectIntegration onCreated');
  let instance = Template.instance();
  
  instance.subscribe('integration_calculated_fields');
  instance.subscribe('integration_display_templates');
  instance.subscribe('integration_import_functions');
  instance.subscribe('integration_servers');
  
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
