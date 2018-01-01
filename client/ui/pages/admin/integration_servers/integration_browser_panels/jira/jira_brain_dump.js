import './jira_brain_dump.html';
import { Template } from 'meteor/templating';
import '../../../../../components/misc/json_info_link';

/**
 * Template Helpers
 */
Template.JiraBrainDump.helpers({
  jiraData () {
    return Template.instance().jiraData.get();
  },
  showLoading () {
    return Template.instance().showLoading.get();
  },
  error () {
    return Template.instance().error.get();
  }
});

/**
 * Template Event Handlers
 */
Template.JiraBrainDump.events({
  'click .btn-refresh' (e, instance) {
    instance.doorbell.set(Date.now());
  }
});

/**
 * Template Created
 */
Template.JiraBrainDump.onCreated(() => {
  let instance = Template.instance();
  
  instance.jiraData    = new ReactiveVar();
  instance.doorbell    = new ReactiveVar(Date.now());
  instance.error       = new ReactiveVar();
  instance.showLoading = new ReactiveVar(true);
  
  instance.autorun(() => {
    let context  = Template.currentData(),
        serverId = FlowRouter.getParam('serverId'),
        doorBell = instance.doorbell.get();
    
    // Fetch the project list
    console.log('JiraBrainDump fetching jiraData for', serverId, doorBell, context);
    instance.showLoading.set(true);
    Meteor.call('fetchIntegrationServerData', serverId, {
      module : context.module,
      method : context.method,
      payload: context.payload
    }, (error, response) => {
      instance.showLoading.set(false);
      if (error) {
        console.error('Fetching data failed:', context, error);
        instance.error.set(error);
        instance.jiraData.set();
      } else {
        instance.error.set();
        instance.jiraData.set(response);
      }
    });
  })
});

/**
 * Template Rendered
 */
Template.JiraBrainDump.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.JiraBrainDump.onDestroyed(() => {
  
});
