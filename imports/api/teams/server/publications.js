import { Meteor } from 'meteor/meteor';
import { Teams } from '../teams.js';

Meteor.publish('teams', function () {
  console.log('Publish: teams');
  if (this.userId) {
    return Teams.find({});
  } else {
    this.ready();
    return [];
  }
});
