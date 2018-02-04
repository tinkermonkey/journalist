import './integration_server_auth_provider.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.IntegrationServerAuthProvider.helpers({});

/**
 * Template Event Handlers
 */
Template.IntegrationServerAuthProvider.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let providerId = $(e.target).closest('.auth-provider-config').attr('data-pk'),
        dataKey  = $(e.target).attr('data-key');
    console.log('Edit auth provider config:', providerId, dataKey, newValue);
    if (providerId && dataKey) {
      Meteor.call('editIntegrationServerAuthProvider', providerId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-add-auth-provider' (e, instance) {
    let serverId = FlowRouter.getParam('serverId');
    
    Meteor.call('addIntegrationServerAuthProvider', serverId, (error, response) => {
      if (error) {
        RobaDialog.error('Insert failed:' + error.toString());
      }
    });
  },
  'click .btn-delete-auth-provider' (e, instance) {
    let providerId = $(e.target).closest('.auth-provider-config').attr('data-pk');
    
    RobaDialog.ask('Delete Server?', 'Are you sure that you want to delete this auth provider configuration?', () => {
      RobaDialog.hide();
      Meteor.call('deleteIntegrationServerAuthProvider', providerId, (error, response) => {
        if (error) {
          RobaDialog.error('Delete failed:' + error.toString());
        }
      });
    });
  }
});

/**
 * Template Created
 */
Template.IntegrationServerAuthProvider.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.IntegrationServerAuthProvider.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IntegrationServerAuthProvider.onDestroyed(() => {
  
});
