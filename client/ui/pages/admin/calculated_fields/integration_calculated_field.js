import './integration_calculated_field.html';
import { Template }                    from 'meteor/templating';
import { RobaDialog }                  from 'meteor/austinsand:roba-dialog';
import { IntegrationCalculatedFields } from '../../../../../imports/api/integrations/integration_calculated_fields';
import '../integration_servers/integration_server_import_testbed';
import '../integration_servers/integration_server_field_reference';
import '../../../components/imported_items/imported_item_schema_reference';

/**
 * Template Helpers
 */
Template.IntegrationCalculatedField.helpers({
  calculatedField () {
    let calculatedFieldId = FlowRouter.getParam('fieldId');
    return IntegrationCalculatedFields.findOne(calculatedFieldId);
  }
});

/**
 * Template Event Handlers
 */
Template.IntegrationCalculatedField.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let calculatedFieldId = FlowRouter.getParam('fieldId'),
        dataKey           = $(e.target).attr('data-key');
    
    console.log('edited:', calculatedFieldId, dataKey, newValue);
    if (calculatedFieldId && dataKey) {
      Meteor.call('editIntegrationCalculatedField', calculatedFieldId, dataKey, newValue, (error, response) => {
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
Template.IntegrationCalculatedField.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('integration_servers');
  
  instance.autorun(() => {
    let calculatedFieldId = FlowRouter.getParam('fieldId');
    
    instance.subscribe('integration_calculated_field', calculatedFieldId);
  })
});

/**
 * Template Rendered
 */
Template.IntegrationCalculatedField.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IntegrationCalculatedField.onDestroyed(() => {
  
});
