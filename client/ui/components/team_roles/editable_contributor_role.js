import './editable_contributor_role.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.EditableContributorRole.helpers({});

/**
 * Template Event Handlers
 */
Template.EditableContributorRole.events({
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
Template.EditableContributorRole.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.EditableContributorRole.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.EditableContributorRole.onDestroyed(() => {
  
});
