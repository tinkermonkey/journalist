import './scheduled_job.html';
import { Template }           from 'meteor/templating';
import { DynamicCollections } from '../../../../../imports/api/dynamic_collections/dynamic_collections';
import { ScheduledJobs }      from '../../../../../imports/api/scheduled_jobs/scheduled_jobs';

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
    
    let jobId = FlowRouter.getParam('jobId'),
        dataKey      = $(e.target).attr('data-key');
    
    console.log('edited:', jobId, dataKey, newValue);
    if (jobId && dataKey) {
      Meteor.call('editScheduledJob', jobId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
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
