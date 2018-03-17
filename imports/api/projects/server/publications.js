import { Meteor }   from 'meteor/meteor';
import { logger }   from 'meteor/austinsand:journalist-logger';
import { Projects } from '../projects.js';

Meteor.publish('projects', function () {
  logger.info('Publish: projects');
  if (this.userId) {
    return Projects.find({});
  } else {
    this.ready();
    return [];
  }
});
