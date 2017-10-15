import { Meteor } from 'meteor/meteor';
import { SystemStatusMetrics } from '../system_status_metrics.js';

Meteor.publish('system_status_metrics', function () {
  console.log('Publish: system_status_metrics');
  if (this.userId) {
    return SystemStatusMetrics.find({});
  } else {
    this.ready();
    return [];
  }
});

