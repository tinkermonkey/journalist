import './contributor_header.html';
import { Template }   from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';

/**
 * Template Helpers
 */
Template.ContributorHeader.helpers({});

/**
 * Template Event Handlers
 */
Template.ContributorHeader.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let contributorId = $(e.target).closest('.contributor-header').attr('data-pk'),
        dataKey       = $(e.target).attr('data-key');
    
    console.log('ContributorHeader edited:', contributorId, dataKey, newValue);
    if (contributorId && dataKey) {
      Meteor.call('editContributor', contributorId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.ContributorHeader.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ContributorHeader.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ContributorHeader.onDestroyed(() => {
  
});
