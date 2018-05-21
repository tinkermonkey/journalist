import './top_nav.html';
import './top_nav.css';
import { Meteor }                 from 'meteor/meteor';
import { Template }               from 'meteor/templating';
import { SystemHealthMetrics }    from '../../../../imports/api/system_health_metrics/system_health_metrics';
import { Backlogs }               from '../../../../imports/api/backlogs/backlogs';
import { CapacityPlans }          from '../../../../imports/api/capacity_plans/capacity_plans';
import { Releases }               from '../../../../imports/api/releases/releases';
import { QuickPopoverController } from '../quick_popover/quick_popover_controller';
import './status_menu_item'
import './top_nav_search_results';

/**
 * Template Helpers
 */
Template.TopNav.helpers({
  statusMetrics (type, unhealthyOnly) {
    let filter = { type: type };
    if (unhealthyOnly) {
      filter.isHealthy = false;
    }
    return SystemHealthMetrics.find(filter, { sort: { isHealthy: 1, sortVersion: 1 } })
  },
  meteorServerStatus () {
    let status = Meteor.status();
    return {
      title    : 'Journalist Server',
      isHealthy: status.connected
    }
  },
  statusSummary () {
    let serverStatus = Meteor.status(),
        status       = SystemHealthMetrics.find({}).map((metric) => {
          return metric.isHealthy
        }).reduce((acc, val) => {
          return acc && val
        }, true) && serverStatus.connected;
    return {
      title    : status === true ? 'System Healthy' : 'System Unhealthy',
      isHealthy: status
    }
  },
  releases () {
    return Releases.find({ isReleased: false }, { sort: { title: 1 } })
  },
  backlogs () {
    return Backlogs.find({ isPublic: true }, { sort: { title: 1 } })
  },
  capacityPlans () {
    return CapacityPlans.find({ isActive: true, selectedOptionId: { $exists: true } }, { sort: { title: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.TopNav.events({
  'keyup .search-field, changed .search-field, click .search-field' (e, instance) {
    let searchTerm = $(e.target).val(),
    formGroup = instance.$('.search-field').closest('.form-group').get(0);
    
    if (searchTerm.length >= 3) {
      QuickPopoverController.show('TopNavSearchResults', { searchTerm: searchTerm }, formGroup, 'bottom');
    } else {
      QuickPopoverController.hide(formGroup);
    }
  },
  'submit .navbar-form' (e, instance) {
    e.preventDefault();
  }
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
