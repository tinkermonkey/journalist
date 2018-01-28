import './top_nav.html';
import './top_nav.css';
import { Template } from 'meteor/templating';
import { SystemHealthMetrics } from '../../../../imports/api/system_health_metrics/system_health_metrics';
import './status_menu_item'

/**
 * Template Helpers
 */
Template.TopNav.helpers({
  statusMetrics (type, unhealthyOnly) {
    let filter = { type: type };
    if(unhealthyOnly){
      filter.isHealthy = false;
    }
    return SystemHealthMetrics.find(filter, { sort: { isHealthy: 1, title: 1 } })
  },
  statusSummary () {
    let status = SystemHealthMetrics.find({}).map((metric) => {
      return metric.isHealthy
    }).reduce((acc, val) => {
      return acc && val
    }, true);
    return {
      title    : status === true ? 'System Healthy' : 'System Unhealthy',
      isHealthy: status
    }
  }
});

/**
 * Template Event Handlers
 */
Template.TopNav.events({});

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
