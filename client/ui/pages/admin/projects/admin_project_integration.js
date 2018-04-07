import './admin_project_integration.html';
import { Template }      from 'meteor/templating';
import { RobaDialog }    from 'meteor/austinsand:roba-dialog';
import { ImportedItems } from '../../../../../imports/api/imported_items/imported_items';
import { Integrations }  from '../../../../../imports/api/integrations/integrations';
import './admin_project_integration_details';
import './admin_integration_imported_item_browser';
import '../integration_servers/integration_server_field_reference';
import '../integration_servers/integration_server_import_testbed';

/**
 * Template Helpers
 */
Template.AdminProjectIntegration.helpers({
  integration () {
    let integrationId = FlowRouter.getParam('integrationId');
    return Integrations.findOne({ _id: integrationId })
  },
  randomImportedItem () {
    let integrationId = FlowRouter.getParam('integrationId');
    return ImportedItems.findOne({ integrationId: integrationId }, { sort: { lastImported: -1 } })
  },
  importedItemQuery () {
    let integrationId = FlowRouter.getParam('integrationId');
    return {
      query: { integrationId: integrationId }
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdminProjectIntegration.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let integrationId = FlowRouter.getParam('integrationId'),
        dataKey       = $(e.target).attr('data-key');
    
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
  let instance = Template.instance();
  
  instance.subscribe('integration_calculated_fields');
  instance.subscribe('display_templates');
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

});

/**
 * Template Destroyed
 */
Template.AdminProjectIntegration.onDestroyed(() => {
  
});
