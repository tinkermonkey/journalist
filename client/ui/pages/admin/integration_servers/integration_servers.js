import './integration_servers.html';
import { Template } from 'meteor/templating';
import { IntegrationServers } from '../../../../../imports/api/integrations/integration_servers';
import { IntegrationTypes } from '../../../../../imports/api/integrations/integration_types';
import { Util } from '../../../../../imports/api/util';

/**
 * Template Helpers
 */
Template.IntegrationServers.helpers({
  types(){
    return _.invert(IntegrationTypes).map((key) => { return { _id: IntegrationTypes[key], title: Util.camelToTitle(key) }})
  },
  servers(){
    return IntegrationServers.find({}, {sort: {integrationType: 1, title: 1}})
  }
});

/**
 * Template Event Handlers
 */
Template.IntegrationServers.events({
  "edited .editable"(e, instance, newValue){
    e.stopImmediatePropagation();
    
    let serverId = $(e.target).closest(".data-table-row").attr("data-pk"),
        dataKey   = $(e.target).attr("data-key");
    
    console.log('edited:', serverId, dataKey, newValue);
    if (serverId && dataKey) {
      Meteor.call('editIntegrationServer', serverId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  "click .btn-add-server"(e, instance){
    let context = Template.currentData();
    
    RobaDialog.show({
      contentTemplate: "AddRecordForm",
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: "Title"
          },
          baseUrl: {
            type : String,
            label: "Base URL"
          }
        })
      },
      title          : "Add Server",
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
            
            // Create the server
            Meteor.call('addIntegrationServer', formData.title, IntegrationTypes.jira, formData.baseUrl, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create server:' + error.toString())
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
  "click .btn-delete-server"(e, instance){
    let serverId = $(e.target).closest(".data-table-row").attr("data-pk"),
        server   = Servers.findOne(serverId);
    
    RobaDialog.ask('Delete Server?', 'Are you sure that you want to delete the server <span class="label label-primary"> ' + server.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteIntegrationServer', serverId, function (error, response) {
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
Template.IntegrationServers.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('integration_servers');
});

/**
 * Template Rendered
 */
Template.IntegrationServers.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IntegrationServers.onDestroyed(() => {
  
});
