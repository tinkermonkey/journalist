import { Meteor }  from 'meteor/meteor';
import { logger }  from 'meteor/austinsand:journalist-logger';
import { Efforts } from '../efforts.js';

Meteor.publish('efforts', function () {
  logger.info('Publish: efforts');
  if (this.userId) {
    let user            = Meteor.user(),
        contributorList = user.contributor().allStaffIds();
    contributorList.push(user.contributor()._id);
    return Efforts.find({ contributorId: { $in: contributorList } });
  } else {
    this.ready();
    return [];
  }
});
