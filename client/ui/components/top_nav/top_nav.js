import './top_nav.html';

import { Template } from 'meteor/templating';
import { SystemHealthMetrics } from '../../../../imports/api/system_health_metrics/system_health_metrics';

/**
 * Template Helpers
 */
Template.TopNav.helpers({
  statusMetrics(){
    return SystemHealthMetrics.find({}, { sort: { isHealthy: 1, key: 1 } })
  },
  statusSummary(){
    let status = SystemHealthMetrics.find({}).map((metric) => {
      return metric.isHealthy
    }).reduce((acc, val) => {
      return acc && val
    }, true);
    return {
      title    : 'System Health',
      isHealthy: status
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
