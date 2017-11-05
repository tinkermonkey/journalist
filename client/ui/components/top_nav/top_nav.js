import './top_nav.html';

import { Template } from 'meteor/templating';
import { SystemStatusMetrics } from '../../../../imports/api/system_status_metrics/system_status_metrics';

/**
 * Template Helpers
 */
Template.TopNav.helpers({
  statusMetrics(){
    return SystemStatusMetrics.find({}, { sort: { healthy: 1, key: 1 } })
  },
  statusSummary(){
    let status = SystemStatusMetrics.find({}).map((metric) => {
      return metric.healthy
    }).reduce((acc, val) => {
      return acc && val
    }, true);
    return {
      title  : 'System Health',
      healthy: status
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TopNav.events({

});

/**
 * Template Created
 */
Template.TopNav.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.TopNav.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TopNav.onDestroyed(() => {
  
});
