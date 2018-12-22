import { Mongo }         from 'meteor/mongo';
import SimpleSchema      from 'simpl-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { SyncedCron }    from 'meteor/littledata:synced-cron';

/**
 * ============================================================================
 * ScheduledJobs
 * ============================================================================
 */
export const ScheduledJob = new SimpleSchema({
  title         : {
    type: String
  },
  preambleCode  : {
    type    : String,
    optional: true
  },
  jobCode       : {
    type    : String,
    optional: true
  },
  laterDirective: {
    type    : String,
    optional: true
  },
  // Standard tracking fields
  dateCreated   : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy     : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified  : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy    : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const ScheduledJobs = new Mongo.Collection("scheduled_jobs");
ScheduledJobs.attachSchema(ScheduledJob);
ChangeTracker.trackChanges(ScheduledJobs, 'ScheduledJobs');

// These are server side only
ScheduledJobs.deny({
  remove () {
    return true;
  },
  insert () {
    return true;
  },
  update () {
    return true;
  }
});

/**
 * Helpers
 */
ScheduledJobs.helpers({
  updateSchedule () {
    console.log('==== ScheduledJob.updateSchedule:', this._id, this.title);
    let job = this;
    
    SyncedCron.remove(job._id);
    if (job.jobCode && job.laterDirective) {
      SyncedCron.add({
        name: job._id,
        schedule (parser) {
          return parser.text(job.laterDirective);
        },
        job () {
          job.execute();
        }
      });
      console.log('==== ScheduledJob scheduled:', job._id, job.title, job.laterDirective);
    } else {
      console.log('==== ScheduledJob skipped because it`s incomplete:', job._id, job.title);
    }
  },
  execute () {
    let job = this;
    
    console.log('==== ScheduledJob executing:', job._id, job.title);
    
    try {
      let code = '(function(){' + "\n" +
          (job.preambleCode || '') + "\n" +
          job.jobCode + "\n" +
          '})()';
      
      eval(code);
    } catch (e) {
      console.error('==== ScheduledJob failed:', job._id, job.title, e)
    }
    
    console.log('==== ScheduledJob complete:', job._id, job.title);
  }
});