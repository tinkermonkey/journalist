import './admin_project_integrations.html';
import { Template } from 'meteor/templating';
import { Integrations } from '../../../../../imports/api/integrations/integrations';
import { IntegrationTypes } from '../../../../../imports/api/integrations/integration_types';
import './add_integration_form';
import './panels/jira_integration_panel';

/**
 * Template Helpers
 */
Template.AdminProjectIntegrations.helpers({
  integrationPanel(){
    switch(this.integrationType){
      case IntegrationTypes.jira:
        return 'JiraIntegrationPanel'
      case IntegrationTypes.confluence:
        return 'ConfluenceIntegrationPanel'
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdminProjectIntegrations.events({
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let integrationId = $(e.target).closest(".data-table-row").attr("data-pk"),
        dataKey       = $(e.target).attr("data-key");
    
    console.log('AdminProjectIntegrations edited:', integrationId, dataKey, newValue);
    if (integrationId !== null && dataKey !== null) {
      // Create the project
      Meteor.call('editIntegration', integrationId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Failed to edit project integration:' + error.toString())
        } else {
          RobaDialog.hide();
        }
      });
    }
  },
  "click .btn-add-integration" (e, instance) {
    let project = Template.currentData();
    
    RobaDialog.show({
      contentTemplate: "AddIntegrationForm",
      contentData    : {
        project: project
      },
      title          : "Add Integration",
      width          : 500,
      buttons        : [
        { text: "Cancel" },
        { text: "Add" }
      ],
      callback       : function (btn) {
        console.log('AdminProjectIntegrations AddIntegrationForm submit:', btn);
        if (btn.match(/add/i)) {
          let formId = 'serverMethodForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the project
            Meteor.call('addIntegration', project._id, formData.integrationType, formData.issueType, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create project integration:' + error.toString())
              } else {
                RobaDialog.hide();
              }
            });
            
            AutoForm.resetForm(formId)
          } else {
            console.warn('Form not valid');
          }
        } else {
          RobaDialog.hide();
        }
      }.bind(this)
    });
  },
  "click .btn-delete-integration" (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let integrationId = $(e.target).closest(".data-table-row").attr("data-pk"),
        integration   = Integrations.findOne(integrationId);
    
    RobaDialog.ask('Delete Integration?', 'Are you sure that you want to delete the integration of <span class="label label-primary">' +
        integration.integrationTypeTitle() + '</span> on the <span class="label label-primary">' + integration.project().title + '</span> project ' +
        'for <span class="label label-primary">' + integration.issueTypeTitle() + '</span> issues?', () => {
      RobaDialog.hide();
      Meteor.call('deleteIntegration', integrationId, function (error, response) {
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
Template.AdminProjectIntegrations.onCreated(() => {

});

/**
 * Template Rendered
 */
Template.AdminProjectIntegrations.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminProjectIntegrations.onDestroyed(() => {
  
});
