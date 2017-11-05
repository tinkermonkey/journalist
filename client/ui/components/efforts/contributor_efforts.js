import './contributor_efforts.html';
import { Template } from 'meteor/templating';
import { Efforts } from '../../../../imports/api/efforts/efforts.js';
import '../add_record_form/add_record_form.js';

/**
 * Template Helpers
 */
Template.ContributorEfforts.helpers({});

/**
 * Template Event Handlers
 */
Template.ContributorEfforts.events({
  "edited .editable"(e, instance, newValue){
    e.stopImmediatePropagation();
    
    let effortId = $(e.target).closest(".data-table-row").attr("data-pk"),
        dataKey  = $(e.target).attr("data-key");
    
    console.log('ContributorEfforts edited:', effortId, dataKey, newValue);
    if (effortId && dataKey) {
      Meteor.call('editEffort', effortId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  "click .btn-add-effort"(e, instance){
    let contributorId = $(e.target).closest(".contributor-efforts").attr("data-pk");
    
    RobaDialog.show({
      contentTemplate: "AddRecordForm",
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Title'
          }
        })
      },
      title          : "Add Effort",
      width          : 500,
      buttons        : [
        { text: "Cancel" },
        { text: "Add" }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = 'addRecordForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the effort
            Meteor.call('addEffort', contributorId, formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create effort:' + error.toString())
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
  },
  "click .btn-delete-effort"(e, instance){
    let effortId = $(e.target).closest(".data-table-row").attr("data-pk"),
        effort   = Efforts.findOne(effortId);
    
    RobaDialog.ask('Delete Effort?', 'Are you sure that you want to delete the effort <span class="label label-primary"> ' + effort.title + '</span> ?', () => {
      Meteor.call('deleteEffort', effortId, function (error, response) {
        if (error) {
          RobaDialog.error("Delete failed: " + error.message);
        } else {
          RobaDialog.hide();
        }
      });
    });
  }
});

/**
 * Template Created
 */
Template.ContributorEfforts.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ContributorEfforts.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ContributorEfforts.onDestroyed(() => {
  
});
