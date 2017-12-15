import './integration_calculated_field.html';
import { Template } from 'meteor/templating';
import { IntegrationCalculatedFields } from '../../../../../imports/api/integrations/integration_calculated_fields';
import { ImportedItem } from '../../../../../imports/api/imported_items/imported_items';
import './integration_server_import_testbed';
import './integration_server_field_reference';

/**
 * Template Helpers
 */
Template.IntegrationCalculatedField.helpers({
  calculatedField () {
    let calculatedFieldId = FlowRouter.getParam('fieldId');
    return IntegrationCalculatedFields.findOne(calculatedFieldId);
  },
  importedItemFieldReference () {
    console.log('ImportedItem:', ImportedItem);
    let itemSchema     = ImportedItem.schema(),
        fieldReference = [];
    _.keys(itemSchema).forEach((key) => {
      let field = itemSchema[key];
      
      // All of the user-facing fields have a descriptive label
      if(field.label && field.label.length){
        field.key = key;
        field.type = field.type && field.type.name;
        fieldReference.push(field);
      }
    });

    return fieldReference
  }
});

/**
 * Template Event Handlers
 */
Template.IntegrationCalculatedField.events({
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let calculatedFieldId = FlowRouter.getParam('fieldId'),
        dataKey          = $(e.target).attr("data-key");
    
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
