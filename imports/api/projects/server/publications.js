import { Meteor }   from 'meteor/meteor';
import { Projects } from '../projects.js';

Meteor.publish('projects', function () {
  console.log('Publish: projects');
  if (this.userId) {
    return Projects.find({});
  } else {
    this.ready();
    return [];
  }
});
