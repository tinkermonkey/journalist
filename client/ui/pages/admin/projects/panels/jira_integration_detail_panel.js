import './jira_integration_detail_panel.html';
import { Template } from 'meteor/templating';
import './jira_integration_query_testbed';

/**
 * Template Helpers
 */
Template.JiraIntegrationDetailPanel.helpers({
  queryDefinitions () {
    let integration = this,
        queryDefinitions = Template.instance().queryDefinitions.get();
    
    // Transform the data structure for easy parsing in the template
    if (queryDefinitions && queryDefinitions.definitions) {
      return _.keys(queryDefinitions.definitions).map((key) => {
        return {
          queryKey: key,
          fieldKey: 'details.' + key,
          fieldvalue: integration.details ? integration.details[key] : null,
          title: queryDefinitions.definitions[ key ],
        }
      })
    }
  },
  showLoading () {
    return Template.instance().showLoading.get();
  }
});

/**
 * Template Event Handlers
 */
Template.JiraIntegrationDetailPanel.events({});

/**
 * Template Created
 */
Template.JiraIntegrationDetailPanel.onCreated(() => {
  let instance = Template.instance();
  
  instance.showLoading      = new ReactiveVar(false);
  instance.queryDefinitions = new ReactiveVar();
  
  instance.autorun(() => {
    let integration      = Template.currentData(),
        queryDefinitions = instance.queryDefinitions.get();
    
    if (integration && integration._id) {
      if (queryDefinitions && queryDefinitions._id === integration._id) {
        // already have the data
        return;
      }
      
      instance.showLoading.set(true);
      Meteor.call('getIntegrationQueryDefinitions', integration._id, (error, response) => {
        instance.showLoading.set(false);
        if (error) {
          console.error('JiraIntegrationDetailPanel getIntegrationQueryDefinitions failed:', error, integration)
        } else {
          console.log('Query Definitions:', response);
          instance.queryDefinitions.set({
            _id        : integration._id,
            definitions: response
          });
        }
      });
    }
  });
});

/**
 * Template Rendered
 */
Template.JiraIntegrationDetailPanel.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.JiraIntegrationDetailPanel.onDestroyed(() => {
  
});
