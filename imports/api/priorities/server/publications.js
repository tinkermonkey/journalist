import { Meteor } from 'meteor/meteor';
import { Priorities } from '../priorities.js';

Meteor.publish('priorities', function () {
  console.log('Publish: priorities');
  if (this.userId) {
    let user            = Meteor.user(),
        contributorList = user.contributor().allReportIds();
    contributorList.push(user.contributor()._id);
    return Priorities.find({ contributorId: { $in: contributorList } });
  } else {
    this.ready();
    return [];
  }
});
