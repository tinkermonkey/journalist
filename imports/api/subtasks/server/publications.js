import { Meteor }   from 'meteor/meteor';
import { Subtasks } from '../subtasks';

Meteor.publish('my_subtasks', function () {
  console.log('Publish: my_subtasks');
  if (this.userId) {
    let user = Meteor.user();
    return Subtasks.find({ contributorId: user.contributor()._id });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('subtasks', function (sourceCollection, sourceId) {
  console.log('Publish: subtasks', sourceCollection, sourceId);
  if (this.userId) {
    let user            = Meteor.user(),
        contributorList = user.contributor().allStaffIds();
    contributorList.push(user.contributor()._id);
    
    return Subtasks.find({
      sourceCollection: sourceCollection,
      sourceId        : sourceId,
      contributorId   : { $in: contributorList }
    });
  } else {
    this.ready();
    return [];
  }
});
