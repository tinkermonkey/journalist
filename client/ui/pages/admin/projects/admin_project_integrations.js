import './admin_project_integrations.html';
import { Template }           from 'meteor/templating';
import { RobaDialog }         from 'meteor/austinsand:roba-dialog';
import { Integrations }       from '../../../../../imports/api/integrations/integrations';
import './add_integration_form';
import './admin_project_integration';

/**
 * Template Helpers
 */
Template.AdminProjectIntegrations.helpers({
});

/**
 * Template Event Handlers
 */
Template.AdminProjectIntegrations.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let integrationId = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey       = $(e.target).attr('data-key');
    
    console.log('AdminProjectIntegrations edited:', integrationId, dataKey, newValue);
    if (integrationId !== null && dataKey !== null) {
      // Create the project
      Meteor.call('editIntegration', integrationId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Failed to edit project integration:' + error.toString())
        }
      });
    }
  },
  'click .btn-add-integration' (e, instance) {
    let project = Template.currentData();
    
    RobaDialog.show({
      contentTemplate: 'AddIntegrationForm',
      contentData    : {
        project: project
      },
      title          : 'Add Integration',
      width          : 500,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Add' }
      ],
      callback       : function (btn) {
        console.log('AdminProjectIntegrations AddIntegrationForm submit:', btn);
        if (btn.match(/add/i)) {
          let formId = $('.roba-dialog form').attr('id');
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the project
            Meteor.call('addIntegration', project._id, formData.serverId, formData.itemType, (error, response) => {
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
  'click .btn-delete-integration' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let integrationId = $(e.target).closest('.data-table-row').attr('data-pk'),
        integration   = Integrations.findOne(integrationId);
    
    RobaDialog.ask('Delete Integration?', 'Are you sure that you want to delete the integration of <span class="label label-primary">' +
        integration.server().title + '</span> on the <span class="label label-primary">' +
        integration.project().title + '</span> project ' +
        'for <span class="label label-primary">' + integration.itemTypeTitle() + '</span> items?', () => {
      RobaDialog.hide();
      Meteor.call('deleteIntegration', integrationId, function (error, response) {
        if (error) {
          RobaDialog.error('Delete failed: ' + error.message);
        }
      });
    });
  }
});

/**
 * Template Created
 */
Template.AdminProjectIntegrations.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('integration_calculated_fields');
  instance.subscribe('display_templates');
  instance.subscribe('integration_import_functions');
  instance.subscribe('integration_servers');
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
