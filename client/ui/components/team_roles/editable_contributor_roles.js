import './editable_contributor_roles.html';
import { Template }             from 'meteor/templating';
import { RobaDialog }           from 'meteor/austinsand:roba-dialog';
import { Contributors }         from '../../../../imports/api/contributors/contributors';
import { ContributorTeamRoles } from '../../../../imports/api/contributors/contributor_team_roles';
import './add_role_form.js';
import './editable_contributor_role';

/**
 * Template Helpers
 */
Template.EditableContributorRoles.helpers({
  contributorRoles () {
    return ContributorTeamRoles.find({ contributorId: this._id }, { sort: { percent: -1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.EditableContributorRoles.events({
  'click .btn-add-role' (e, instance) {
    let contributor = Template.currentData();
    
    RobaDialog.show({
      contentTemplate: 'AddRoleForm',
      contentData    : {
        contributor: contributor
      },
      title          : 'Add Role',
      width          : 500,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Add' }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = $('.roba-dialog form').attr('id');
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the project
            Meteor.call('addContributorTeamRole', contributor._id, formData.teamId, formData.roleId, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create team role:' + error.toString())
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
  'click .btn-delete-role' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let contributorId = $(e.target).closest('.editable-contributor-roles').attr('data-pk'),
        roleId        = $(e.target).closest('.data-table-row').attr('data-pk'),
        contributor   = Contributors.findOne(contributorId),
        teamRole      = ContributorTeamRoles.findOne(roleId);
    
    RobaDialog.ask('Delete Role?', 'Are you sure that you want to delete the role of <span class="label label-primary"> ' +
        contributor.name + '</span> on the <span class="label label-primary"> ' + teamRole.team().title + '</span> team?', () => {
      RobaDialog.hide();
      Meteor.call('deleteContributorTeamRole', roleId, function (error, response) {
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
Template.EditableContributorRoles.onCreated(() => {

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
