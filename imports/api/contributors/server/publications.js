import { Meteor } from 'meteor/meteor';
import { Contributors } from '../contributors';

Meteor.publish("contributors", function () {
  console.info("Publish: contributors");
  if (this.userId) {
    return Contributors.find({});
  } else {
    this.ready();
    return [];
  }
});
