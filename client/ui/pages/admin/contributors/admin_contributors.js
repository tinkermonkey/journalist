import './admin_contributors.html';
import { Template }                   from 'meteor/templating';
import SimpleSchema                   from 'simpl-schema';
import { RobaDialog }                 from 'meteor/austinsand:roba-dialog';
import { Contributors }               from '../../../../../imports/api/contributors/contributors.js';
import { ContributorRoleDefinitions } from '../../../../../imports/api/contributors/contributor_role_definitions.js';
import { UserTypes }                  from '../../../../../imports/api/users/user_types';
import { Util }                       from '../../../../../imports/api/util';
import '../../../components/add_record_form/add_record_form.js';
import '../../../components/team_roles/editable_team_roster.js';
import '../admin_home/admin_stats_contributors';
import './admin_contributors_table';

/**
 * Template Helpers
 */
Template.AdminContributors.helpers({
  roleDefinitions () {
    return ContributorRoleDefinitions.find({}, { sort: { order: 1 } })
  },
  contributors () {
    return Contributors.find({ roleId: this._id, isActive: true }, { sort: { name: 1 } })
  },
  inactiveContributors () {
    return Contributors.find({ isActive: false }, { sort: { name: 1 } })
  },
  unassignedContributors () {
    return Contributors.find({ roleId: { $exists: false }, isActive: true }, { sort: { name: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.AdminContributors.events({
  'click .btn-add-contributor' (e, instance) {
    let roleDefinition = this;
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          email: {
            type : String,
            regEx: SimpleSchema.RegEx.Email,
            label: 'Email'
          },
          name : {
            type    : String,
            optional: true,
            label   : 'Name'
          },
        })
      },
      title          : 'Add Contributor',
      width          : 500,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Add' }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = 'addRecordForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the contributor
            Meteor.call('addContributor', formData.email, formData.name, roleDefinition._id, (error, response) => {
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
  'click .btn-add-user' (e, instance) {
    let context     = Template.currentData(),
        contributor = this;
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          email   : {
            type    : String,
            regEx   : SimpleSchema.RegEx.Email,
            label   : 'Email',
            autoform: {
              type : 'hidden',
              value: contributor.email
            }
          },
          name    : {
            type    : String,
            optional: true,
            label   : 'Name',
            autoform: {
              type : 'hidden',
              value: contributor.name
            }
          },
          password: {
            type : String,
            label: 'Password'
          },
          usertype: {
            type    : Number,
            label   : 'User Type',
            autoform: {
              options: _.keys(UserTypes).map((key) => {
                return { label: Util.camelToTitle(key), value: UserTypes[ key ] }
              })
            }
          }
        })
      },
      title          : 'Add User',
      width          : 400,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Add' }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = 'addRecordForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Set the usertype
            //console.log('Add user data:', formData);
            
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
        } else {
          RobaDialog.hide();
        }
      }.bind(this)
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
