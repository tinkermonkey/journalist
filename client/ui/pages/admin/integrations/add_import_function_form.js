import './add_import_function_form.html';
import { Template } from 'meteor/templating';
import { Util } from '../../../../../imports/api/util';
import { IntegrationTypes } from '../../../../../imports/api/integrations/integration_types';

let schema = new SimpleSchema({
  title          : {
    type: String
  },
  integrationType: {
    type: Number
  }
});

/**
 * Template Helpers
 */
Template.AddImportFunctionForm.helpers({
  getSchema () {
    return schema
  },
  integrationTypeOptions () {
    return _.keys(IntegrationTypes).map((key) => {
      return { _id: IntegrationTypes[ key ], title: Util.camelToTitle(key) }
    })
  }
});

/**
 * Template Event Handlers
 */
Template.AddImportFunctionForm.events({});

/**
 * Template Created
 */
Template.AddImportFunctionForm.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AddImportFunctionForm.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AddImportFunctionForm.onDestroyed(() => {
  
});
