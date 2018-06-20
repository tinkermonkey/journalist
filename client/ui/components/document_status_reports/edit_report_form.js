import './edit_report_form.html';
import { Template }      from 'meteor/templating';
import { Random }        from 'meteor/random';
import { RobaDialog }    from 'meteor/austinsand:roba-dialog';
import { StatusReports } from '../../../../imports/api/status_reports/status_reports';

/**
 * Template Helpers
 */
Template.EditReportForm.helpers({
  report () {
    let context = this;
    if (context.reportId) {
      return StatusReports.findOne(context.reportId)
    }
  }
});

/**
 * Template Event Handlers
 */
Template.EditReportForm.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let statusReportId = $(e.target).closest('.edit-report-form').attr('data-pk'),
        dataKey        = $(e.target).attr('data-key');
    
    console.log('EditReportForm edited:', statusReportId, dataKey, newValue);
    if (statusReportId && dataKey) {
      Meteor.call('editStatusReport', statusReportId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-close-form' (e, instance) {
    Blaze.remove(instance.view);
  },
  'click .btn-submit-report' (e, instance) {
    let statusReportId = $(e.target).closest('.edit-report-form').attr('data-pk');
    
    if (statusReportId) {
      Meteor.call('submitStatusReport', statusReportId, function (error, response) {
        if (error) {
          RobaDialog.error('Submit failed: ' + error.message);
        } else {
          Blaze.remove(instance.view);
        }
      });
    }
  },
  'submit form' (e, instance) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

/**
 * Template Created
 */
Template.EditReportForm.onCreated(() => {
  let instance = Template.instance();
  
  instance.formId = Random.id();
});

/**
 * Template Rendered
 */
Template.EditReportForm.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.EditReportForm.onDestroyed(() => {
  
});
