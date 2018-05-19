import { Meteor } from 'meteor/meteor';

Meteor.publish('', function () {
  console.log('Publish: ');
  if (this.userId) {
    //return Investigations.find({});
  } else {
    this.ready();
    return [];
  }
});
