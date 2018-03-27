import './admin_release_table.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.AdminReleaseTable.helpers({});

/**
 * Template Event Handlers
 */
Template.AdminReleaseTable.events({
  'edited .editable'(e, instance, newValue){
    e.stopImmediatePropagation();
  
    let releaseId = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey  = $(e.target).attr('data-key');
  
    console.log('AdminReleaseTable edited:', releaseId, dataKey, newValue);
    if (releaseId && dataKey) {
      Meteor.call('editRelease', releaseId, dataKey, newValue, (error, response) => {
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
Template.AdminReleaseTable.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminReleaseTable.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminReleaseTable.onDestroyed(() => {
  
});
