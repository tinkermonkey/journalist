import './active_reports.html';
import { Template }           from 'meteor/templating';
import { RobaDialog }         from 'meteor/austinsand:roba-dialog';
import { StatusReports }      from '../../../../imports/api/status_reports/status_reports';
import { StatusReportStates } from '../../../../imports/api/status_reports/status_report_states';
import './add_report_form.js';

/**
 * Template Helpers
 */
Template.ActiveReports.helpers({
  activeReports () {
    return StatusReports.find({
      sourceCollection: this.sourceCollection,
      sourceId        : this.sourceId,
      state           : { $ne: StatusReportStates.submitted }
    });
  }
});

/**
 * Template Event Handlers
 */
Template.ActiveReports.events({
  'click .btn-assign-report' (e, instance) {
    let context = instance.data;
    
    if (context.sourceCollection && context.sourceId) {
      
      // Show a form to select a date and contributor
      RobaDialog.show({
        contentTemplate: 'AddReportForm',
        title          : 'Assign Report',
        width          : 500,
        buttons        : [
          { text: 'Cancel' },
          { text: 'Assign' }
        ],
        callback       : function (btn) {
          if (btn.match(/assign/i)) {
            let formId = $('.roba-dialog form').attr('id');
            if (AutoForm.validateForm(formId)) {
              let formData = AutoForm.getFormValues(formId).insertDoc;
              console.log('Form Data: ', formData);
              // Create the project
              Meteor.call('addStatusReport', formData.contributorId, context.sourceCollection, context.sourceId, StatusReportStates.assigned, formData.dueDate, (error, response) => {
                if (error) {
                  RobaDialog.error('Failed to create report:' + error.toString())
                } else {
                  RobaDialog.hide();
                }
              });
              AutoForm.resetForm(formId)
            } else {
              console.warn('Form not valid');
            }
          } else {
            RobaDialog.hide();
          }
        }.bind(this)
      });
      
    }
  }
});

/**
 * Template Created
 */
Template.ActiveReports.onCreated(() => {
  let instance = Template.instance();
  
  // Subscribe to open reports for this item
  instance.autorun(() => {
    let context = Template.currentData();
    
    instance.subscribe('incomplete_reports', context.sourceCollection, context.sourceId);
  })
});

/**
 * Template Rendered
 */
Template.ActiveReports.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
  
  })
});

/**
 * Template Destroyed
 */
Template.ActiveReports.onDestroyed(() => {
  
});
