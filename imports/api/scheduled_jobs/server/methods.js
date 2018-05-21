import { Meteor }        from 'meteor/meteor';
import { check, Match }  from 'meteor/check';
import { Auth }          from '../../auth';
import { ScheduledJobs } from '../scheduled_jobs';

Meteor.methods({
  /**
   * Add a scheduled job
   * @param title
   */
  addScheduledJob (title) {
    console.log('addScheduledJob:', title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Insert the project percent
      ScheduledJobs.insert({
        title: title
      });
    } else {
      console.error('Non-admin user tried to add a scheduled job:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a scheduled job for a project
   * @param jobId
   */
  deleteScheduledJob (jobId) {
    console.log('deleteScheduledJob:', jobId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(jobId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      ScheduledJobs.remove(jobId);
    } else {
      console.error('Non-admin user tried to delete a scheduled job:', user.username, jobId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a scheduled job record
   * @param jobId
   * @param key
   * @param value
   */
  editScheduledJob (jobId, key, value) {
    console.log('editScheduledJob:', jobId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(jobId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the job record to make sure this is authorized
    let job = ScheduledJobs.findOne(jobId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (job) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        ScheduledJobs.update(jobId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit a scheduled job:', user.username, key, value, jobId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Execute a job
   * @param jobId
   */
  executeScheduledJob(jobId){
    console.log('executeScheduledJob:', jobId);
    let user = Auth.requireAuthentication();
  
    // Validate the data is complete
    check(jobId, String);
  
    // Get the job record to make sure this is authorized
    let job = ScheduledJobs.findOne(jobId);
  
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (job) {
        job.execute();
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit a scheduled job:', user.username, key, value, jobId);
      throw new Meteor.Error(403);
    }
  }
});
