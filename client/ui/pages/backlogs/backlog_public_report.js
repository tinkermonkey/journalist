import './backlog_public_report.html';
import { Template } from 'meteor/templating';
import { Backlogs } from '../../../../imports/api/backlogs/backlogs';
import './default_backlog_public_report';

/**
 * Template Helpers
 */
Template.BacklogPublicReport.helpers({
  backlog () {
    let backlogId = FlowRouter.getParam('backlogId');
    if (backlogId) {
      return Backlogs.findOne(backlogId)
    }
  }
});

/**
 * Template Event Handlers
 */
Template.BacklogPublicReport.events({});

/**
 * Template Created
 */
Template.BacklogPublicReport.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('backlog_item_categories');
  
  instance.autorun(() => {
    let backlogId = FlowRouter.getParam('backlogId');
    
    instance.subscribe('backlog', backlogId);
    instance.subscribe('backlog_items', backlogId);
  })
});

/**
 * Template Rendered
 */
Template.BacklogPublicReport.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.BacklogPublicReport.onDestroyed(() => {
  
});
