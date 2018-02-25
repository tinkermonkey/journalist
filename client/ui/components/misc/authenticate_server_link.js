import './authenticate_server_link.html';
import { Template } from 'meteor/templating';
import SimpleSchema from 'simpl-schema';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';

/**
 * Template Helpers
 */
Template.AuthenticateServerLink.helpers({});

/**
 * Template Event Handlers
 */
Template.AuthenticateServerLink.events({
  'click .btn-log-in-server' (e, instance) {
    let server = this;
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          username: {
            type : String,
            label: 'Username'
          },
          password: {
            type    : String,
            label   : 'Password',
            autoform: {
              afFieldInput: {
                type: 'password'
              }
            }
          }
        })
      },
      title          : 'Authenticate to ' + server.title,
      width          : 500,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Log In' }
      ],
      callback       : function (btn) {
        console.log('authentication link login button clicked');
        if (btn.match(/log in/i)) {
          let formId = 'addRecordForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            AutoForm.resetForm(formId);
            
            console.log('Making call to authenticateIntegrationServer...');
            Meteor.call('authenticateIntegrationServer', server._id, formData.username, formData.password, (error, response) => {
              console.log('authenticateIntegrationServer response:', error, response);
              if (error) {
                RobaDialog.error('Failed to authenticate to server:' + error.toString())
              } else if(response.success === false) {
                RobaDialog.error('Authentication Failed')
              } else {
                RobaDialog.hide();
              }
            });
          } else {
            console.log('Login form not valid:', AutoForm.validateForm(formId));
            AutoForm.resetForm(formId);
          }
        } else {
          AutoForm.resetForm('addRecordForm');
          RobaDialog.hide();
        }
      }.bind(this)
    });
  },
  'click .btn-log-out-server' (e, instance) {
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
  }
});

/**
 * Template Created
 */
Template.AuthenticateServerLink.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AuthenticateServerLink.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AuthenticateServerLink.onDestroyed(() => {
  
});
