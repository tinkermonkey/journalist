import './editable_contributor_roles.html';
import { Template } from 'meteor/templating';
import { Contributors } from '../../../../imports/api/contributors/contributors';
import { ContributorTeamRoles } from '../../../../imports/api/contributors/contributor_team_roles';
import { ContributorRoles } from '../../../../imports/api/contributors/contributor_roles.js';
import './add_role_form.js';

/**
 * Template Helpers
 */
Template.EditableContributorRoles.helpers({
  roles(){
    return ContributorTeamRoles.find({ contributorId: this._id }, { sort: { percent: -1 } })
  },
  ContributorRoles(){
    return ContributorRoles
  },
  showPercent(){
    return this.role === ContributorRoles.developer || this.role === ContributorRoles.qa
  }
});

/**
 * Template Event Handlers
 */
Template.EditableContributorRoles.events({
  "edited .editable"(e, instance, newValue){
    e.stopImmediatePropagation();
    
    let roleId  = $(e.target).closest(".data-table-row").attr("data-pk"),
        dataKey = $(e.target).attr("data-key");
    
    console.log('EditableContributorRoles edited:', roleId, dataKey, newValue);
    if (roleId && dataKey) {
      // Create the project
      Meteor.call('editContributorTeamRole', roleId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Failed to edit team role:' + error.toString())
        } else {
          RobaDialog.hide();
        }
      });
    }
  },
  "click .btn-add-role"(e, instance){
    let contributor = Template.currentData();
    
    RobaDialog.show({
      contentTemplate: "AddRoleForm",
      title          : "Add Role",
      width          : 400,
      buttons        : [
        { text: "Cancel" },
        { text: "Add" }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = 'serverMethodForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the project
            Meteor.call('addContributorTeamRole', contributor._id, formData.teamId, formData.role, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create team role:' + error.toString())
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
  "click .btn-delete-role"(e, instance, newValue){
    e.stopImmediatePropagation();
    
    let contributorId = $(e.target).closest(".editable-contributor-roles").attr("data-pk"),
        roleId        = $(e.target).closest(".data-table-row").attr("data-pk"),
        contributor   = Contributors.findOne(contributorId),
        role          = ContributorTeamRoles.findOne(roleId);
    
    RobaDialog.ask('Delete Role?', 'Are you sure that you want to delete the role of <span class="label label-primary"> ' +
        contributor.name + '</span> on the <span class="label label-primary"> ' + role.team().title + '</span> team?', () => {
      RobaDialog.hide();
      Meteor.call('deleteContributorTeamRole', roleId, function (error, response) {
        if (error) {
          RobaDialog.error("Delete failed: " + error.message);
        }
      });
    });
    
  },
});

/**
 * Template Created
 */
Template.EditableContributorRoles.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let contributor = Template.currentData();
    
  })
});

/**
 * Template Rendered
 */
Template.EditableContributorRoles.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.EditableContributorRoles.onDestroyed(() => {
  
});
