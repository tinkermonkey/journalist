import './admin_teams.html';
import { Template }     from 'meteor/templating';
import SimpleSchema     from 'simpl-schema';
import { RobaDialog }   from 'meteor/austinsand:roba-dialog';
import { Contributors } from '../../../../../imports/api/contributors/contributors';
import { Teams }        from '../../../../../imports/api/teams/teams.js';
import { UserTypes }    from '../../../../../imports/api/users/user_types';
import '../../../components/add_record_form/add_record_form.js';
import '../../../components/team_roles/editable_team_roster.js';

/**
 * Template Helpers
 */
Template.AdminTeams.helpers({
  teams () {
    return Teams.find({}, { sort: { title: 1 } })
  },
  reporterSelectorContext () {
    return {
      valueField  : '_id',
      displayField: 'name',
      value       : this.reportingContributorId,
      dataKey     : 'reportingContributorId',
      collection  : Contributors,
      emptyText   : 'Select a default reporter',
      cssClass    : 'inline-block',
      query       : {
        usertype: { $in: [ UserTypes.manager, UserTypes.administrator ] }
      }
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdminTeams.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let teamId  = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey = $(e.target).attr('data-key');
    
    if (teamId && dataKey) {
      Meteor.call('editTeam', teamId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-add-team' (e, instance) {
    let context = Template.currentData();
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Title'
          }
        })
      },
      title          : 'Add Team',
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
            
            // Create the team
            Meteor.call('addTeam', formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create team:' + error.toString())
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
  'click .btn-delete-team' (e, instance) {
    let teamId = $(e.target).closest('.data-table-row').attr('data-pk'),
        team   = Teams.findOne(teamId);
    
    RobaDialog.ask('Delete Team?', 'Are you sure that you want to delete the team <span class="label label-primary"> ' + team.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteTeam', teamId, function (error, response) {
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
Template.AdminTeams.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminTeams.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminTeams.onDestroyed(() => {
  
});
