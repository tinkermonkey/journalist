import './admin_release_table.html';
import './admin_release_table.css';
import { Template } from 'meteor/templating';
import '../../../components/editable_date/editable_date';
import { Releases } from '../../../../../imports/api/releases/releases';

/**
 * Template Helpers
 */
Template.AdminReleaseTable.helpers({});

/**
 * Template Event Handlers
 */
Template.AdminReleaseTable.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let releaseId = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey   = $(e.target).attr('data-key');
    
    console.log('AdminReleaseTable edited:', releaseId, dataKey, newValue);
    if (releaseId && dataKey) {
      Meteor.call('editRelease', releaseId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-delete-release' (e, instance) {
    let releaseId = $(e.target).closest('.data-table-row').attr('data-pk'),
        release   = Releases.findOne(releaseId);
    
    RobaDialog.ask('Delete Release?', 'Are you sure that you want to delete the release <span class="label label-primary"> ' + release.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteRelease', releaseId, function (error, response) {
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
Template.AdminReleaseTable.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('integration_servers');
  instance.subscribe('integration_server_caches', 'versionList');
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
