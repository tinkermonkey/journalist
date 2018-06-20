import './admin_releases.html';
import { Template } from 'meteor/templating';
import { Releases } from '../../../../../imports/api/releases/releases';
import SimpleSchema from 'simpl-schema';

/**
 * Template Helpers
 */
Template.AdminReleases.helpers({
  activeReleases () {
    return Releases.find({ isReleased: false }, { sort: { internalReleaseDate: 1, sortVersion: 1 } })
  },
  inactiveReleases () {
    return Releases.find({ isReleased: true }, { sort: { sortVersion: -1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.AdminReleases.events({
  'click .btn-add-release' (e, instance) {
    let context = Template.currentData();
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title        : {
            type : String,
            label: 'Title'
          },
          versionNumber: {
            type    : String,
            label   : 'Version Number',
            optional: true
          },
          isReleased   : {
            type    : Boolean,
            label   : 'Is Released',
            optional: true
          }
        })
      },
      title          : 'Add Release',
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
            
            // Create the release
            Meteor.call('addRelease', formData.title, formData.versionNumber, formData.isReleased, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create release:' + error.toString())
              } else {
                RobaDialog.hide();
              }
            });
            
            AutoForm.resetForm(formId)
          }
        } else {
          RobaDialog.hide();
        }
      }.bind(this)
    });
  }
});

/**
 * Template Created
 */
Template.AdminReleases.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('releases')
});

/**
 * Template Rendered
 */
Template.AdminReleases.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminReleases.onDestroyed(() => {
  
});
