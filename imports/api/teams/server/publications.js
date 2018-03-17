import { Meteor } from 'meteor/meteor';
import { logger } from 'meteor/austinsand:journalist-logger';
import { Teams }  from '../teams.js';

Meteor.publish('teams', function () {
  logger.info('Publish: teams');
  if (this.userId) {
    return Teams.find({});
  } else {
    this.ready();
    return [];
  }
});
