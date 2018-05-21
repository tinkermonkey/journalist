import './scheduled_job.html';
import { Template }                 from 'meteor/templating';
import { ScheduledJobs }            from '../../../../../imports/api/scheduled_jobs/scheduled_jobs';
import { DynamicCollectionManager } from '../../../../../imports/api/dynamic_collection_manager';

/**
 * Template Helpers
 */
Template.ScheduledJob.helpers({
  scheduledJob () {
    let jobId = FlowRouter.getParam('jobId');
    return ScheduledJobs.findOne(jobId)
  }
});

/**
 * Template Event Handlers
 */
Template.ScheduledJob.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let jobId   = FlowRouter.getParam('jobId'),
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
  'click .btn-execute' (e, instance) {
    let jobId = FlowRouter.getParam('jobId');
    
    console.log('Executing Job:', jobId);
    if (jobId) {
      // Recompile on the server first
      Meteor.call('executeScheduledJob', jobId, (error, response) => {
        if (error) {
          RobaDialog.error('Job execution failed on server:' + error.toString());
        } else {
          RobaDialog.ask('Done', 'Job execution complete');
        }
      });
    }
  },
  'click .btn-export' (e, instance) {
    let scheduleJob = this;
    
    if (scheduleJob._id) {
      Meteor.call('exportDocument', 'ScheduledJobs', scheduleJob._id, (error, response) => {
        if (error) {
          RobaDialog.error('Export failed:' + error.toString());
        } else {
          let a = window.document.createElement('a');
          
          a.setAttribute('href', '/export/' + response);
          a.setAttribute('target', '_blank');
          a.click();
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.ScheduledJob.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ScheduledJob.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ScheduledJob.onDestroyed(() => {
  
});
