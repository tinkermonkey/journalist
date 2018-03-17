import { Meteor }              from 'meteor/meteor';
import { logger }              from 'meteor/austinsand:journalist-logger';
import { SystemHealthMetrics } from '../system_health_metrics.js';

Meteor.publish('system_health_metrics', function () {
  logger.info('Publish: system_health_metrics');
  if (this.userId) {
    return SystemHealthMetrics.find({});
  } else {
    this.ready();
    return [];
  }
});

