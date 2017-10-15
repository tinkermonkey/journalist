import './admin_user_list.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { UserTypes } from '../../../../../imports/api/users/user_types.js';
import './add_user_form.html';

/**
 * Template Helpers
 */
Template.AdminUserList.helpers({
  users(){
    console.log('users:', this.usertype);
    if (this.usertype !== null) {
      return Meteor.users.find({ usertype: this.usertype }, { sort: { username: 1 } })
    }
  },
  userEmail(){
    return this.emails && this.emails.length && this.emails[ 0 ] && this.emails[ 0 ].address
  },
  UserTypes(){
    return UserTypes
  }
});

/**
 * Template Event Handlers
 */
Template.AdminUserList.events({
  "edited .editable"(e, instance, newValue){
    e.stopImmediatePropagation();
    
    let userId  = $(e.target).closest(".data-table-row").attr("data-pk"),
        dataKey = $(e.target).attr("data-key");
    
    console.log('edited:', userId, dataKey, newValue);
    if (userId && dataKey) {
      Meteor.call('editUser', userId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  "click .btn-add-user"(e, instance){
    let context = Template.currentData();
    
    RobaDialog.show({
      contentTemplate: "AddUserForm",
      title          : "Add User",
      width          : 600,
      buttons        : [
        { text: "Cancel" },
        { text: "Add" }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = 'insertUserForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Set the usertype
            formData.usertype = context.usertype;
            console.log('Add user data:', formData);
            
            // Create the user
            Meteor.call('addUser', formData, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create user:' + error.toString())
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
  "click .btn-delete-user"(e, instance){
    let userId = $(e.target).closest(".data-table-row").attr("data-pk"),
        user   = Meteor.users.findOne(userId);
    
    RobaDialog.ask('Delete User?', 'Are you sure that you want to delete the user <span class="label label-primary"> ' + user.profile.name + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteUser', userId, function (error, response) {
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
Template.AdminUserList.onCreated(() => {

});

/**
 * Template Rendered
 */
Template.AdminUserList.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminUserList.onDestroyed(() => {
  
});
