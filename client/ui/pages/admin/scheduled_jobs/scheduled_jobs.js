import './scheduled_jobs.html';
import { Template }      from 'meteor/templating';
import { ScheduledJobs } from '../../../../../imports/api/scheduled_jobs/scheduled_jobs';
import SimpleSchema      from 'simpl-schema';
import '../../../components/editable_later_directive/editable_later_directive';

/**
 * Template Helpers
 */
Template.ScheduledJobs.helpers({
  scheduledJobs () {
    return ScheduledJobs.find({}, { sort: { title: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.ScheduledJobs.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let jobId   = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey = $(e.target).attr('data-key');
    
    console.log('edited:', jobId, dataKey, newValue);
    if (jobId && dataKey) {
      Meteor.call('editScheduledJob', jobId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-add-scheduled-job' (e, instance) {
    let context = Template.currentData();
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Title'
          }
        })
      },
      title          : 'Add Scheduled Job',
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
            
            // Create the collection
            console.log('AddScheduledJob:', formData);
            Meteor.call('addScheduledJob', formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create scheduled job:' + error.toString())
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
  'click .btn-delete-scheduled-job' (e, instance) {
    let collection = this;
    
    RobaDialog.ask('Delete Scheduled Job?', 'Are you sure that you want to delete the scheduled job <span class="label label-primary"> ' + collection.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteScheduledJob', collection._id, function (error, response) {
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
Template.ScheduledJobs.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('scheduled_jobs');
});

/**
 * Template Rendered
 */
Template.ScheduledJobs.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ScheduledJobs.onDestroyed(() => {
  
});
