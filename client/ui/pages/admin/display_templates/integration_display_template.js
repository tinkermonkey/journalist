import './integration_display_template.html';
import { Template } from 'meteor/templating';
import { IntegrationDisplayTemplates } from '../../../../../imports/api/integrations/integration_display_templates';

/**
 * Template Helpers
 */
Template.IntegrationDisplayTemplate.helpers({
  displayTemplate() {
    let templateId = FlowRouter.getParam('templateId');
    return IntegrationDisplayTemplates.findOne(templateId);
  },
  previewError(){
    return Template.instance().previewError.get()
  },
  previewMessage(){
    return Template.instance().previewMessage.get()
  }
});

/**
 * Template Event Handlers
 */
Template.IntegrationDisplayTemplate.events({
  'edited .editable'(e, instance, newValue) {
    e.stopImmediatePropagation();

    let displayTemplateId = FlowRouter.getParam('templateId'),
      dataKey = $(e.target).attr("data-key");

    console.log('edited:', displayTemplateId, dataKey, newValue);
    if (displayTemplateId && dataKey) {
      Meteor.call('editIntegrationDisplayTemplate', displayTemplateId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-preview'(e, instance) {
    let displayTemplate = this;

    instance.previewError.set(null);
    instance.previewMessage.set(null);
    instance.$('.preview-container').empty();

    console.log('IntegrationDisplayTemplate Preview:', displayTemplate);
    try {
      Template[displayTemplate.templateName] = new Template(displayTemplate.templateName, eval(SpacebarsCompiler.compile(displayTemplate.templateLayout, { isTemplate: true })));
    } catch (e) {
      instance.previewError.set({ step: 'SpacebarsCompiler', error: e});
    }

    try {
      Template[displayTemplate.templateName].helpers(eval('new Object(' + displayTemplate.templateHelpers + ')'));
    } catch (e) {
      instance.previewError.set({ step: 'Helpers Compiler', error: e});
    }

    try {
      Template[displayTemplate.templateName].events(eval('new Object(' + displayTemplate.templateEvents + ')'));
    } catch (e) {
      instance.previewError.set({ step: 'Events Compiler', error: e});
    }

    try {
      Template[displayTemplate.templateName].onCreated(new Function(displayTemplate.templateCreated));
    } catch (e) {
      instance.previewError.set({ step: 'Created Compiler', error: e});
    }

    try {
      Template[displayTemplate.templateName].onRendered(new Function(displayTemplate.templateRendered));
    } catch (e) {
      instance.previewError.set({ step: 'Rendered Compiler', error: e});
    }

    try {
      Template[displayTemplate.templateName].onDestroyed(new Function(displayTemplate.templateDestroyed));
    } catch (e) {
      instance.previewError.set({ step: 'Destroyed Compiler', error: e});
    }

    try {
      Blaze.renderWithData(Template[displayTemplate.templateName], {what: 'ever'}, instance.$('.preview-container').get(0))
      instance.previewMessage.set('Rendered at ' + moment().format('hh:mm:ss'));
    } catch (e) {
      instance.previewError.set({ step: 'Template Instantiation', error: e});
    }
  }
});

/**
 * Template Created
 */
Template.IntegrationDisplayTemplate.onCreated(() => {
  let instance = Template.instance();

  instance.previewError = new ReactiveVar();
  instance.previewMessage = new ReactiveVar();
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
