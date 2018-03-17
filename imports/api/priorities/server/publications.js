import { Meteor }     from 'meteor/meteor';
import { logger }     from 'meteor/austinsand:journalist-logger';
import { Priorities } from '../priorities.js';

Meteor.publish('priorities', function () {
  logger.info('Publish: priorities');
  if (this.userId) {
    let user            = Meteor.user(),
        contributorList = user.contributor().allStaffIds();
    contributorList.push(user.contributor()._id);
    return Priorities.find({ contributorId: { $in: contributorList } });
  } else {
    this.ready();
    return [];
  }
});
