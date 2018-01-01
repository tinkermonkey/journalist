import './integration_import_functions.html';
import { Template } from 'meteor/templating';
import { IntegrationImportFunctions } from '../../../../../imports/api/integrations/integration_import_functions';
import './add_import_function_form';

/**
 * Template Helpers
 */
Template.IntegrationImportFunctions.helpers({
  importFunctions () {
    return IntegrationImportFunctions.find({}, { sort: { title: 1 } })
  }
  
});

/**
 * Template Event Handlers
 */
Template.IntegrationImportFunctions.events({
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let importFunctionId = $(e.target).closest(".data-table-row").attr("data-pk"),
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
  "click .btn-add-import-function" (e, instance) {
    let context = Template.currentData();
    
    RobaDialog.show({
      contentTemplate: "AddImportFunctionForm",
      title          : "Add Import Function",
      width          : 500,
      buttons        : [
        { text: "Cancel" },
        { text: "Add" }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = 'serverMethodForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the importFunction
            Meteor.call('addIntegrationImportFunction', formData.title, formData.integrationType, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create import function:' + error.toString())
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
  "click .btn-delete-import-function" (e, instance) {
    let importFunction = this;
    
    RobaDialog.ask('Delete Function?', 'Are you sure that you want to delete the import function <span class="label label-primary"> ' + importFunction.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteIntegrationImportFunction', importFunction._id, function (error, response) {
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
Template.IntegrationImportFunctions.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('integration_import_functions');
});

/**
 * Template Rendered
 */
Template.IntegrationImportFunctions.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IntegrationImportFunctions.onDestroyed(() => {
  
});
