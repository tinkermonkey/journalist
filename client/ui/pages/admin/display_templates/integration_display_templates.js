import './integration_display_templates.html';
import { Template } from 'meteor/templating';
import { IntegrationDisplayTemplates } from '../../../../../imports/api/integrations/integration_display_templates';
import '../integration_servers/integration_server_field_reference';

/**
 * Template Helpers
 */
Template.IntegrationDisplayTemplates.helpers({
  displayTemplates () {
    return IntegrationDisplayTemplates.find({}, { sort: { title: 1 } })
  }
  
});

/**
 * Template Event Handlers
 */
Template.IntegrationDisplayTemplates.events({
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let displayTemplateId = $(e.target).closest(".data-table-row").attr("data-pk"),
        dataKey           = $(e.target).attr("data-key");
    
    console.log('edited:', displayTemplateId, dataKey, newValue);
    if (displayTemplateId && dataKey) {
      Meteor.call('editIntegrationDisplayTemplate', displayTemplateId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  "click .btn-add-display-template" (e, instance) {
    let context = Template.currentData();
    
    RobaDialog.show({
      contentTemplate: "AddRecordForm",
      contentData    : {
        schema: new SimpleSchema({
          title    : {
            type : String,
            label: 'Title'
          },
          templateName    : {
            type : String,
            label: 'Template Name'
          }
        })
      },
      title          : "Add Display Template",
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
            
            // Create the display template
            Meteor.call('addIntegrationDisplayTemplate', formData.title, formData.templateName, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create display template:' + error.toString())
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
  "click .btn-delete-display-template" (e, instance) {
    let displayTemplate = this;
    
    RobaDialog.ask('Delete Template?', 'Are you sure that you want to delete the display template <span class="label label-primary"> ' + displayTemplate.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteIntegrationDisplayTemplate', displayTemplate._id, function (error, response) {
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
Template.IntegrationDisplayTemplates.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('integration_display_templates');
});

/**
 * Template Rendered
 */
Template.IntegrationDisplayTemplates.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IntegrationDisplayTemplates.onDestroyed(() => {
  
});
