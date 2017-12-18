import './jira_integration_query_testbed.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.JiraIntegrationQueryTestbed.helpers({
  showLoading () {
    return Template.instance().showLoading.get();
  },
  query () {
    return Template.instance().query.get();
  },
  result () {
    return Template.instance().result.get();
  }
});

/**
 * Template Event Handlers
 */
Template.JiraIntegrationQueryTestbed.events({
  'click .btn-run-query' (e, instance) {
    let data  = Template.currentData(),
        query = instance.query.get();
    
    if (data.integration && data.integration.serverId) {
      instance.showLoading.set(true);
      Meteor.call('testIntegration', data.integration._id, { queryKey: query.queryKey }, (error, response) => {
        instance.showLoading.set(false);
        if (error) {
          console.error('JiraIntegrationQueryTestbed testIntegration failed:', error);
          instance.error.set(error);
          instance.result.set();
        } else {
          console.info('JiraIntegrationQueryTestbed testIntegration response:', response);
          instance.error.set();
          instance.result.set(response);
        }
      });
    }
  },
  'click .query-dropdown li' (e, instance) {
    let query = this;
    console.log('Query selected:', query);
    Template.instance().query.set(query);
  }
});

/**
 * Template Created
 */
Template.JiraIntegrationQueryTestbed.onCreated(() => {
  let instance = Template.instance();
  
  instance.query       = new ReactiveVar();
  instance.result      = new ReactiveVar();
  instance.error       = new ReactiveVar();
  instance.showLoading = new ReactiveVar(false);
  
  instance.autorun(() => {
    let query = instance.query.get(),
        context = Template.currentData();
    
    console.log('JiraIntegrationQueryTestbed:', context);
    
    if(!query && context && context.queryDefinitions && context.queryDefinitions.length){
      console.log('JiraIntegrationQueryTestbed auto-setting query:', query);
      instance.query.set(context.queryDefinitions[0]);
    }
  })
});

/**
 * Template Rendered
 */
Template.JiraIntegrationQueryTestbed.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.JiraIntegrationQueryTestbed.onDestroyed(() => {
  
});
