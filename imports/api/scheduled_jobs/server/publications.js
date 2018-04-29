import { Meteor }        from 'meteor/meteor';
import { ScheduledJobs } from '../scheduled_jobs';

Meteor.publish('scheduled_jobs', function () {
  console.log('Publish: scheduled_jobs');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return ScheduledJobs.find({});
    } else {
      console.warn('scheduled_jobs requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});
