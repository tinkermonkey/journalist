import { Meteor } from 'meteor/meteor';
import { Efforts } from '../efforts.js';

Meteor.publish('efforts', function () {
  console.log('Publish: efforts');
  if (this.userId) {
    let user            = Meteor.user(),
        contributorList = user.contributor().allReportIds();
    contributorList.push(user.contributor()._id);
    return Efforts.find({ contributorId: { $in: contributorList } });
  } else {
    this.ready();
    return [];
  }
});
