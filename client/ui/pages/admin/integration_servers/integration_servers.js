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
  "click .btn-log-in-server"(e, instance){
    let server = this;
    
    RobaDialog.show({
      contentTemplate: "AddRecordForm",
      contentData    : {
        schema: new SimpleSchema({
          username: {
            type : String,
            label: "Username"
          },
          password: {
            type : String,
            label: "Password"
          }
        })
      },
      title          : "Authenticate to " + server.title,
      width          : 500,
      buttons        : [
        { text: "Cancel" },
        { text: "Log In" }
      ],
      callback       : function (btn) {
        if (btn.match(/log in/i)) {
          let formId = 'addRecordForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            RobaDialog.hide();
            
            console.log('Making call to authenticateIntegrationServer...');
            Meteor.call('authenticateIntegrationServer', server._id, formData.username, formData.password, (error, response) => {
              console.log('authenticateIntegrationServer response:', error, response);
              if (error) {
                RobaDialog.error('Failed to authenticate to server:' + error.toString())
              }
            });
            
            AutoForm.resetForm(formId)
          }
        } else {
          RobaDialog.hide();
        }
      }.bind(this)
    });
  },
  "click .btn-log-out-server"(e, instance){
    let server = this;
    
    RobaDialog.ask('Log out of server', 'Are you sure you want to log out of the server <span class="label label-primary"> ' + server.title + '</span> ?', () => {
      console.log('Making call to authenticateIntegrationServer...');
      Meteor.call('unAuthenticateIntegrationServer', server._id, (error, response) => {
        console.log('unAuthenticateIntegrationServer response:', error, response);
        if (error) {
          RobaDialog.error('Request to un-authenticate returned an error:' + error.toString())
        }
      });
    });
  },
  "click .btn-delete-server"(e, instance){
    let server = this;
    
    RobaDialog.ask('Delete Server?', 'Are you sure that you want to delete the server <span class="label label-primary"> ' + server.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteIntegrationServer', server._id, function (error, response) {
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
