import { Meteor }       from 'meteor/meteor';
import { Backlogs }     from '../backlogs';
import { BacklogItems } from '../backlog_items';

Meteor.publish('backlogs', function () {
  console.log('Publish: backlogs');
  if (this.userId) {
    return Backlogs.find({ isPublic: true });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('admin_backlogs', function () {
  console.log('Publish: admin_backlogs');
  if (this.userId) {
    return Backlogs.find({});
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('backlog_items', function () {
  console.log('Publish: backlog_items');
  if (this.userId) {
    return BacklogItems.find({});
  } else {
    this.ready();
    return [];
  }
});
