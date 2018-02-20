import './admin_display_template_link.html';
import { Template }         from 'meteor/templating';
import { DisplayTemplates } from '../../../../imports/api/display_templates/display_templates';

/**
 * Template Helpers
 */
Template.AdminDisplayTemplateLink.helpers({
  template () {
    let templateName = this.templateName;
    
    return DisplayTemplates.findOne({ templateName: templateName })
  }
});

/**
 * Template Event Handlers
 */
Template.AdminDisplayTemplateLink.events({});

/**
 * Template Created
 */
Template.AdminDisplayTemplateLink.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminDisplayTemplateLink.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminDisplayTemplateLink.onDestroyed(() => {
  
});
