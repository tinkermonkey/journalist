import './import_export.html';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';

/**
 * Template Helpers
 */
Template.ImportExport.helpers({
  uploadCallbacks: function () {
    return {
      finished: function (index, file, context) {
        Meteor.call('importData', file.name, (error) => {
          if (error) {
            RobaDialog.error(error);
          }
        });
      }
    }
  }
});

/**
 * Template Event Handlers
 */
Template.ImportExport.events({
  "click .btn-export" (e, template) {
    Meteor.call('exportData', (error, result) => {
      if (error) {
        RobaDialog.error(error);
      }
      else {
        let a = window.document.createElement('a');
        
        a.setAttribute('href', '/export/' + result);
        a.setAttribute('target', '_blank');
        a.click();
      }
    });
  }
});

/**
 * Template Created
 */
Template.ImportExport.onCreated(() => {

});

/**
 * Template Rendered
 */
Template.ImportExport.onRendered(() => {

});

/**
 * Template Destroyed
 */
Template.ImportExport.onDestroyed(() => {

});