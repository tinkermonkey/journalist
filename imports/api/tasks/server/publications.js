import { Meteor } from 'meteor/meteor';
import { Tasks } from '../tasks.js';

Meteor.publish('tasks', function () {
  console.log('Publish: tasks');
  if (this.userId) {
    let user            = Meteor.user(),
        contributorList = user.contributor().allStaffIds();
    contributorList.push(user.contributor()._id);
    return Tasks.find({ contributorId: { $in: contributorList } });
  } else {
    this.ready();
    return [];
  }
});
