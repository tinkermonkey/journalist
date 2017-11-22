import './add_integration_form.html';
import { Template } from 'meteor/templating';
import { Util } from '../../../../../imports/api/util';
import { IntegrationTypes } from '../../../../../imports/api/integrations/integration_types';
import { IssueTypes } from '../../../../../imports/api/imported_issues/issue_types';

let schema = new SimpleSchema({
  integrationType: {
    type : String
  },
  issueType: {
    type : String
  }
});

/**
 * Template Helpers
 */
Template.AddIntegrationForm.helpers({
  getSchema () {
    return schema
  },
  integrationTypeOptions() {
    return _.keys(IntegrationTypes).map((key) => { return {_id: IntegrationTypes[key], title: Util.camelToTitle(key)}})
  },
  issueTypeOptions () {
    return _.keys(IssueTypes).map((key) => { return {_id: IssueTypes[key], title: Util.camelToTitle(key)}})
  }
});

/**
 * Template Event Handlers
 */
Template.AddIntegrationForm.events({});

/**
 * Template Created
 */
Template.AddIntegrationForm.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AddIntegrationForm.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AddIntegrationForm.onDestroyed(() => {
  
});
