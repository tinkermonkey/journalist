import './project_header.html';
import { Template }   from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import './project_team_roster';

/**
 * Template Helpers
 */
Template.ProjectHeader.helpers({});

/**
 * Template Event Handlers
 */
Template.ProjectHeader.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let projectId = $(e.target).closest('.project-header').attr('data-pk'),
        dataKey   = $(e.target).attr('data-key');
    
    console.log('edited:', projectId, dataKey, newValue);
    if (projectId && dataKey) {
      Meteor.call('editProject', projectId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
});

/**
 * Template Created
 */
Template.ProjectHeader.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ProjectHeader.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ProjectHeader.onDestroyed(() => {
  
});
