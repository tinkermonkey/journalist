import './admin_backlogs.html';
import SimpleSchema from 'simpl-schema';
import { Template } from 'meteor/templating';
import { Backlogs } from '../../../../../imports/api/backlogs/backlogs';

/**
 * Template Helpers
 */
Template.AdminBacklogs.helpers({
  publicBacklogs () {
    return Backlogs.find({ isPublic: true }, { sort: { title: 1 } })
  },
  nonPublicBacklogs () {
    return Backlogs.find({ isPublic: false }, { sort: { title: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.AdminBacklogs.events({
  'click .btn-add-backlog' (e, instance) {
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Backlog Title'
          }
        })
      },
      title          : 'Add Backlog',
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
            
            // Create the display template
            Meteor.call('addBacklog', formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create backlog:' + error.toString())
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
  }
});

/**
 * Template Created
 */
Template.AdminBacklogs.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('admin_backlogs')
});

/**
 * Template Rendered
 */
Template.AdminBacklogs.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminBacklogs.onDestroyed(() => {
  
});
