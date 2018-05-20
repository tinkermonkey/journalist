import './backlog_team_report.html';
import { Template } from 'meteor/templating';
import { Backlogs } from '../../../../imports/api/backlogs/backlogs';
import './default_backlog_team_report';

/**
 * Template Helpers
 */
Template.BacklogTeamReport.helpers({
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
Template.BacklogTeamReport.events({});

/**
 * Template Created
 */
Template.BacklogTeamReport.onCreated(() => {
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
Template.BacklogTeamReport.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.BacklogTeamReport.onDestroyed(() => {
  
});
