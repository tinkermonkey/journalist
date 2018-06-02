import './jira_integration_detail_column.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.JiraIntegrationDetailColumn.helpers({
  queryDefinitions () {
    let integration      = this,
        queryDefinitions = Template.instance().queryDefinitions.get();
    
    // Transform the data structure for easy parsing in the template
    if (queryDefinitions && queryDefinitions.definitions) {
      return _.keys(queryDefinitions.definitions).map((key) => {
        return {
          queryKey  : key,
          fieldKey  : 'details.' + key,
          fieldValue: integration.details ? integration.details[ key ] : null,
          title     : queryDefinitions.definitions[ key ],
        }
      })
    }
  }
});

/**
 * Template Event Handlers
 */
Template.JiraIntegrationDetailColumn.events({});

/**
 * Template Created
 */
Template.JiraIntegrationDetailColumn.onCreated(() => {
  let instance = Template.instance();
  
  instance.queryDefinitions = new ReactiveVar();
  
  instance.autorun(() => {
    let integration      = Template.currentData(),
        queryDefinitions = instance.queryDefinitions.get();
    
    if (integration && integration._id) {
      if (queryDefinitions && queryDefinitions._id === integration._id) {
        // already have the data
        return;
      }
      
      Meteor.call('getIntegrationQueryDefinitions', integration._id, (error, response) => {
        if (error) {
          console.error('JiraIntegrationDetailColumn getIntegrationQueryDefinitions failed:', error, integration)
        } else {
          //console.log('Query Definitions:', response);
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
Template.JiraIntegrationDetailColumn.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.JiraIntegrationDetailColumn.onDestroyed(() => {
  
});
