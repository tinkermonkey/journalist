import { Meteor } from 'meteor/meteor';
import { SystemHealthMetrics } from '../system_health_metrics.js';

Meteor.publish('system_health_metrics', function () {
  console.log('Publish: system_health_metrics');
  if (this.userId) {
    return SystemHealthMetrics.find({});
  } else {
    this.ready();
    return [];
  }
});

