import './admin_contributors.html';
import { Template } from 'meteor/templating';
import { Contributors } from '../../../../../imports/api/contributors/contributors.js';
import { ContributorRoleDefinitions } from '../../../../../imports/api/contributors/contributor_role_definitions.js';
import '../../../components/add_record_form/add_record_form.js';
import '../../../components/team_roles/editable_team_roster.js';

/**
 * Template Helpers
 */
Template.AdminContributors.helpers({
  roleDefinitions () {
    let definitions = ContributorRoleDefinitions.find({}, { sort: { order: 1 } }).fetch();
    definitions.push({ title: "Unassigned" });
    return definitions
  },
  contributors () {
    return Contributors.find({ roleId: this._id }, { sort: { email: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.AdminContributors.events({
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let contributorId = $(e.target).closest(".data-table-row").attr("data-pk"),
        dataKey       = $(e.target).attr("data-key");
    
    console.log('AdminContributors edited:', contributorId, dataKey, newValue);
    if (contributorId && dataKey) {
      Meteor.call('editContributor', contributorId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  "click .btn-add-contributor" (e, instance) {
    let roleDefinition = this;
    
    RobaDialog.show({
      contentTemplate: "AddRecordForm",
      contentData    : {
        schema: new SimpleSchema({
          identifier: {
            type : String,
            label: 'Identifier'
          },
          email     : {
            type : String,
            regEx: SimpleSchema.RegEx.Email,
            label: 'Email'
          },
          name      : {
            type    : String,
            optional: true,
            label   : 'Name'
          },
        })
      },
      title          : "Add Contributor",
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
            
            // Create the contributor
            Meteor.call('addContributor', formData.identifier, formData.email, formData.name, roleDefinition._id, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create contributor:' + error.toString())
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
  "click .btn-delete-contributor" (e, instance) {
    let contributorId = $(e.target).closest(".data-table-row").attr("data-pk"),
        contributor   = Contributors.findOne(contributorId);
    
    RobaDialog.ask('Delete Contributor?', 'Are you sure that you want to delete the contributor <span class="label label-primary"> ' + contributor.identifier + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteContributor', contributorId, function (error, response) {
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
Template.AdminContributors.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminContributors.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminContributors.onDestroyed(() => {
  
});
