import './admin_contributors_table.html';
import { Template }     from 'meteor/templating';
import { Contributors } from '../../../../../imports/api/contributors/contributors';

/**
 * Template Helpers
 */
Template.AdminContributorsTable.helpers({
  contributorTeamsList () {
    return this.participatingTeams().map((team) => {
      return team._id
    })
  }
});

/**
 * Template Event Handlers
 */
Template.AdminContributorsTable.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let contributorId = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey       = $(e.target).attr('data-key');
    
    console.log('AdminContributors edited:', contributorId, dataKey, newValue);
    
    if (contributorId && dataKey) {
      if (dataKey === 'contributorTeamsList') {
        Meteor.call('editContributorTeamMemberships', contributorId, newValue, (error, response) => {
          if (error) {
            RobaDialog.error('Update failed:' + error.toString());
          }
        });
      } else {
        Meteor.call('editContributor', contributorId, dataKey, newValue, (error, response) => {
          if (error) {
            RobaDialog.error('Update failed:' + error.toString());
          }
        });
      }
    }
  },
  'click .btn-delete-contributor' (e, instance) {
    let contributorId = $(e.target).closest('.data-table-row').attr('data-pk'),
        contributor   = Contributors.findOne(contributorId);
    
    RobaDialog.ask('Delete Contributor?', 'Are you sure that you want to delete the contributor <span class="label label-primary"> ' + contributor.email + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteContributor', contributorId, function (error, response) {
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
Template.AdminContributorsTable.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminContributorsTable.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminContributorsTable.onDestroyed(() => {
  
});
