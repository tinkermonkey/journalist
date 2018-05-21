import './admin_team_contributor_role.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.AdminTeamContributorRole.helpers({});

/**
 * Template Event Handlers
 */
Template.AdminTeamContributorRole.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let roleId  = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey = $(e.target).attr('data-key');
    
    if (roleId !== null && dataKey !== null) {
      // Create the project
      Meteor.call('editContributorTeamRole', roleId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Failed to edit team role:' + error.toString())
        } else {
          RobaDialog.hide();
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.AdminTeamContributorRole.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminTeamContributorRole.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminTeamContributorRole.onDestroyed(() => {
  
});
