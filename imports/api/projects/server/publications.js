import { Meteor }   from 'meteor/meteor';
import { Projects } from '../projects.js';

Meteor.publish('projects', function () {
  console.log('Publish: projects');
  return Projects.find({});
});
