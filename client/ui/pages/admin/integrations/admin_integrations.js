import './admin_integrations.html';
import { Template }     from 'meteor/templating';
import './admin_integrations_table';
import { Integrations } from '../../../../../imports/api/integrations/integrations';

/**
 * Template Helpers
 */
Template.AdminIntegrations.helpers({
  integrations () {
    return Integrations.find({}, { sort: { projectId: 1 } }).fetch().sort((a, b) => {
      if (a.projectId === b.projectId) {
        return a.itemType > b.itemType ? 1 : -1
      } else {
        return a.project().title > b.project().title ? 1 : -1
      }
    })
  },
});

/**
 * Template Event Handlers
 */
Template.AdminIntegrations.events({});

/**
 * Template Created
 */
Template.AdminIntegrations.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('all_integrations');
  instance.subscribe('integration_import_functions');
  instance.subscribe('integration_calculated_fields');
});

/**
 * Template Rendered
 */
Template.AdminIntegrations.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminIntegrations.onDestroyed(() => {
  
});
