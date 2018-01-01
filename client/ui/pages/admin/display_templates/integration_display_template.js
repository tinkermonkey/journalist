import './integration_display_template.html';
import { Template } from 'meteor/templating';
import { IntegrationDisplayTemplates } from '../../../../../imports/api/integrations/integration_display_templates';

/**
 * Template Helpers
 */
Template.IntegrationDisplayTemplate.helpers({
  displayTemplate () {
    let templateId = FlowRouter.getParam('templateId');
    return IntegrationDisplayTemplates.findOne(templateId);
  },
  
});

/**
 * Template Event Handlers
 */
Template.IntegrationDisplayTemplate.events({
  "edited .editable" (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let displayTemplateId = FlowRouter.getParam('templateId'),
        dataKey           = $(e.target).attr("data-key");
    
    console.log('edited:', displayTemplateId, dataKey, newValue);
    if (displayTemplateId && dataKey) {
      Meteor.call('editIntegrationDisplayTemplate', displayTemplateId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
});

/**
 * Template Created
 */
Template.IntegrationDisplayTemplate.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.IntegrationDisplayTemplate.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IntegrationDisplayTemplate.onDestroyed(() => {
  
});
