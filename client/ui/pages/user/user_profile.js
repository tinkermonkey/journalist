import './user_profile.html';
import { Template }   from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { AutoForm }   from 'meteor/aldeed:autoform';
import SimpleSchema   from 'simpl-schema';

/**
 * Template Helpers
 */
Template.UserProfile.helpers({});

/**
 * Template Event Handlers
 */
Template.UserProfile.events({
  'click .btn-verify-email' (e, instance) {
    let email = this;
    RobaDialog.ask(
        'Send email verification?',
        'Would you like to send a verification email to <span class="label label-primary">' + email.address + '</span>?', () => {
          console.log('Yes!')
        });
  },
  'click .btn-change-password' (e, instance) {
    let user                 = this,
        changePasswordSchema = new SimpleSchema({
          currentPassword: {
            type    : String,
            label   : 'Current password',
            autoform: {
              afFieldInput: {
                type: 'password'
              }
            }
          },
          newPassword    : {
            type    : String,
            label   : 'New password',
            autoform: {
              afFieldInput: {
                type: 'password'
              }
            }
          },
          confirmPassword: {
            type    : String,
            label   : 'Confirm password',
            optional: false,
            autoform: {
              afFieldInput: {
                type: 'password'
              }
            },
            custom  : function () {
              if (this.value && this.value.length) {
                let newPassword = this.field('newPassword').value;
                console.log('Custom validation:', this.value, newPassword, this.value === newPassword, SimpleSchema.ErrorTypes.REQUIRED);
                if (this.value !== newPassword) {
                  return SimpleSchema.ErrorTypes.REQUIRED
                }
              } else {
                console.log('Confirm not set:', SimpleSchema.ErrorTypes.REQUIRED);
                return SimpleSchema.ErrorTypes.REQUIRED
              }
            }
          }
        });
    
    AutoForm.debug(true);
    
    // Add the validation for password matching
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: changePasswordSchema
      },
      title          : 'Change password',
      width          : 400,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Change' }
      ],
      callback       : function (btn) {
        let formId = $('.roba-dialog form').attr('id');
        if (btn.match(/change/i)) {
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Make sure the password is confirmed
            AutoForm.resetForm(formId);
            
            Accounts.changePassword(formData.currentPassword, formData.newPassword, (error) => {
              if (error) {
                RobaDialog.error(error.toString())
              } else {
                RobaDialog.hide();
              }
            })
          } else {
            console.error('Change password form not valid')
          }
        } else {
          AutoForm.resetForm(formId);
          RobaDialog.hide();
        }
      }.bind(this)
    });
  }
});

/**
 * Template Created
 */
Template.UserProfile.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.UserProfile.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.UserProfile.onDestroyed(() => {
  
});
