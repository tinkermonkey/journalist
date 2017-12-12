import './integration_import_function.html';
import { Template } from 'meteor/templating';
import { IntegrationImportFunctions } from '../../../../../imports/api/integrations/integration_import_functions';
import './integration_server_import_testbed';

/**
 * Template Helpers
 */
Template.IntegrationImportFunction.helpers({
  importFunction(){
    let importFunctionId = FlowRouter.getParam('functionId');
    return IntegrationImportFunctions.findOne(importFunctionId);
  }
});

/**
 * Template Event Handlers
 */
Template.IntegrationImportFunction.events({
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let importFunctionId = FlowRouter.getParam('functionId'),
        dataKey          = $(e.target).attr("data-key");
    
    console.log('edited:', importFunctionId, dataKey, newValue);
    if (importFunctionId && dataKey) {
      Meteor.call('editIntegrationImportFunction', importFunctionId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
});

/**
 * Template Created
 */
Template.IntegrationImportFunction.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('integration_servers');
  
  instance.autorun(() => {
    let importFunctionId = FlowRouter.getParam('functionId');
  
    instance.subscribe('integration_import_function', importFunctionId);
  })
});

/**
 * Template Rendered
 */
Template.IntegrationImportFunction.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IntegrationImportFunction.onDestroyed(() => {
  
});
