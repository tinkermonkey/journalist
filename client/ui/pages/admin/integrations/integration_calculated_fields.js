import './integration_calculated_fields.html';
import { Template } from 'meteor/templating';
import { IntegrationCalculatedFields } from '../../../../../imports/api/integrations/integration_calculated_fields';

/**
 * Template Helpers
 */
Template.IntegrationCalculatedFields.helpers({
  calculatedFields () {
    return IntegrationCalculatedFields.find({}, { sort: { title: 1 } })
  }
  
});

/**
 * Template Event Handlers
 */
Template.IntegrationCalculatedFields.events({
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let calculatedFieldId = $(e.target).closest(".data-table-row").attr("data-pk"),
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
  "click .btn-add-calculated-field" (e, instance) {
    let context = Template.currentData();
    
    RobaDialog.show({
      contentTemplate: "AddRecordForm",
      contentData    : {
        schema: new SimpleSchema({
          title    : {
            type : String,
            label: 'Title'
          }
        })
      },
      title          : "Add Calculated Field",
      width          : 500,
      buttons        : [
        { text: "Cancel" },
        { text: "Add" }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = 'addRecordForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the calculatedField
            Meteor.call('addIntegrationCalculatedField', formData.title, formData.integrationType, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create calculated field:' + error.toString())
              } else {
                RobaDialog.hide();
              }
            });
            
            AutoForm.resetForm(formId)
          }
          return;
        }
        RobaDialog.hide();
      }.bind(this)
    });
  },
  "click .btn-delete-calculated-field" (e, instance) {
    let calculatedField = this;
    
    RobaDialog.ask('Delete Function?', 'Are you sure that you want to delete the calculated field <span class="label label-primary"> ' + calculatedField.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteIntegrationCalculatedField', calculatedField._id, function (error, response) {
        if (error) {
          RobaDialog.error("Delete failed: " + error.message);
        }
      });
    });
  }
});

/**
 * Template Created
 */
Template.IntegrationCalculatedFields.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('integration_calculated_fields');
});

/**
 * Template Rendered
 */
Template.IntegrationCalculatedFields.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IntegrationCalculatedFields.onDestroyed(() => {
  
});
