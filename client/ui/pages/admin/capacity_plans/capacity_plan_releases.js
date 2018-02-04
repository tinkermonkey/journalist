import './capacity_plan_releases.html';
import { Template }             from 'meteor/templating';
import SimpleSchema             from 'simpl-schema';
import { RobaDialog }           from 'meteor/austinsand:roba-dialog';
import { CapacityPlanReleases } from '../../../../../imports/api/capacity_plans/capacity_plan_releases';

/**
 * Template Helpers
 */
Template.CapacityPlanReleases.helpers({
  releases () {
    let plan = this;
    return CapacityPlanReleases.find({ planId: this._id }, { sort: { title: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.CapacityPlanReleases.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    let releaseId = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey   = $(e.target).attr('data-key');
    
    if (releaseId && dataKey) {
      Meteor.call('editCapacityPlanRelease', releaseId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-add-release' (e, instance) {
    let plan = this;
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Release Title'
          }
        })
      },
      title          : 'Add Capacity Plan Release',
      width          : 500,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Add' }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = 'addRecordForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the display template
            Meteor.call('addCapacityPlanRelease', plan._id, formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create capacity plan release:' + error.toString())
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
  },
  'click .btn-delete-release' (e, instance) {
    let release = this;
    
    RobaDialog.ask('Delete Release?', 'Are you sure that you want to delete the planed release <span class="label label-primary"> ' + release.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteCapacityPlanRelease', release._id, function (error, response) {
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
Template.CapacityPlanReleases.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.CapacityPlanReleases.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.CapacityPlanReleases.onDestroyed(() => {
  
});
