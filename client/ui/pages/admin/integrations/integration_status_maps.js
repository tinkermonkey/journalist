import './integration_status_maps.html';
import { Template } from 'meteor/templating';
import { IntegrationStatusMaps } from '../../../../../imports/api/integrations/integration_status_maps';
import { IntegrationServers } from '../../../../../imports/api/integrations/integration_servers';

/**
 * Template Helpers
 */
Template.IntegrationStatusMaps.helpers({
  statusMaps () {
    return IntegrationStatusMaps.find({}, { sort: { title: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.IntegrationStatusMaps.events({
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let mapId   = $(e.target).closest(".data-table-row").attr("data-pk"),
        dataKey = $(e.target).attr("data-key");
    
    console.log('IntegrationStatusMap edited:', mapId, dataKey, newValue);
    if (mapId && dataKey) {
      Meteor.call('editIntegrationStatusMap', mapId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  "click .btn-add-map" (e, instance) {
    let context = Template.currentData();
    
    RobaDialog.show({
      contentTemplate: "AddRecordForm",
      contentData    : {
        schema: new SimpleSchema({
          title   : {
            type : String,
            label: "Title"
          },
          serverId: {
            type    : String,
            label   : "Server",
            autoform: {
              options: IntegrationServers.find({}).map((server) => {
                return { 'label': server.title, 'value': server._id }
              })
            }
          }
        })
      },
      title          : "Add Status Map",
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
            Meteor.call('addIntegrationStatusMap', formData.title, formData.serverId, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create map:' + error.toString())
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
  "click .btn-delete-map" (e, instance) {
    let map = this;
    
    RobaDialog.ask('Delete Status Map?', 'Are you sure that you want to delete the status map <span class="label label-primary"> ' + map.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteIntegrationStatusMap', map._id, function (error, response) {
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
Template.IntegrationStatusMaps.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('integration_status_maps');
  instance.subscribe('integration_status_servers');
});

/**
 * Template Rendered
 */
Template.IntegrationStatusMaps.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IntegrationStatusMaps.onDestroyed(() => {
  
});
