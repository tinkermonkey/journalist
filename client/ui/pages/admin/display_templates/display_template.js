import './display_template.html';
import { Template }   from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Util }       from '../../../../../imports/api/util';

/**
 * Template Helpers
 */
Template.DisplayTemplate.helpers({
  previewError () {
    return Template.instance().previewError.get()
  },
  previewMessage () {
    return Template.instance().previewMessage.get()
  },
  allowPublish () {
    return Template.instance().allowPublish.get()
  }
});

/**
 * Template Event Handlers
 */
Template.DisplayTemplate.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let displayTemplate = Template.currentData(),
        dataKey         = $(e.target).attr('data-key');
    
    //console.log('edited:', displayTemplateId, dataKey, newValue);
    if (displayTemplate._id && dataKey && dataKey) {
      instance.allowPublish.set(false);
      Meteor.call('editDisplayTemplate', displayTemplate._id, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-preview' (e, instance) {
    let displayTemplate = this,
        previewContext,
        templateCode;
    
    instance.previewError.set(null);
    instance.previewMessage.set(null);
    instance.$('.preview-container').empty();
    
    console.log('DisplayTemplate Preview:', displayTemplate);
    
    try {
      previewContext = eval('(function () {' + (displayTemplate.previewContext || '') + '})()');
    } catch (e) {
      instance.previewError.set({ step: 'Context Compiler', error: e });
    }
    
    try {
      instance.$('.preview-container').append('<style>' + displayTemplate.templateCSS + '</style>');
    } catch (e) {
      instance.previewError.set({ step: 'CSS Compilation', error: e });
    }
    
    try {
      templateCode = Util.compileTemplate(displayTemplate);
    } catch (e) {
      instance.previewError.set({ step: 'Template Compilation', error: e, templateCode: templateCode });
    }
    
    try {
      Blaze.renderWithData(Template[ displayTemplate.templateName ], previewContext, instance.$('.preview-container').get(0));
      instance.previewMessage.set('Rendered version ' + displayTemplate.currentVersion.toString() + ' at ' + moment().format('hh:mm:ss'));
      instance.allowPublish.set(true);
    } catch (e) {
      instance.previewError.set({ step: 'Template Instantiation', error: e, templateCode: templateCode });
    }
  },
  'click .btn-publish' (e, instance) {
    let displayTemplate = this;
    
    if (displayTemplate._id) {
      instance.allowPublish.set(false);
      Meteor.call('publishIntegrationDisplayTemplate', displayTemplate._id, (error, response) => {
        if (error) {
          RobaDialog.error('Publish failed:' + error.toString());
        }
      });
    }
  },
  'submit .navbar-form' (e, instance) {
    e.preventDefault();
  }
});

/**
 * Template Created
 */
Template.DisplayTemplate.onCreated(() => {
  let instance = Template.instance();
  
  instance.previewError   = new ReactiveVar();
  instance.previewMessage = new ReactiveVar();
  instance.allowPublish   = new ReactiveVar(false);
});

/**
 * Template Rendered
 */
Template.DisplayTemplate.onRendered(() => {

});

/**
 * Template Destroyed
 */
Template.DisplayTemplate.onDestroyed(() => {

});
