import './display_template_layer.html';
import { Template } from 'meteor/templating';
import { PublishedDisplayTemplates } from '../../../imports/api/display_templates/published_display_templates';
import { Util } from '../../../imports/api/util';

/**
 * Template Helpers
 */
Template.DisplayTemplateLayer.helpers({
  ready () {
    let dataReady      = Template.instance().subscriptionsReady(),
        templatesReady = Template.instance().templatesRendered.get();
    console.log(Util.timestamp(), 'DisplayTemplateLayer ready:', dataReady, templatesReady, dataReady && templatesReady);
    return dataReady && templatesReady
  }
});

/**
 * Template Event Handlers
 */
Template.DisplayTemplateLayer.events({});

/**
 * Template Created
 */
Template.DisplayTemplateLayer.onCreated(() => {
  let instance = Template.instance();

  instance.templatesRendered = new ReactiveVar(false);
  instance.subscribe('published_display_templates');
  
  instance.autorun(() => {
    console.log(Util.timestamp(), 'DisplayTemplateLayer autorun fired');
    let publishedTemplates = PublishedDisplayTemplates.find({});
    instance.templatesRendered.set(false);
    $('#display-template-layer-css').empty();
    if (instance.subscriptionsReady()) {
      console.log(Util.timestamp(), 'DisplayTemplateLayer compilation starting:', publishedTemplates.count());
      publishedTemplates.forEach((displayTemplate) => {
        console.log(Util.timestamp(), 'DisplayTemplateLayer:', displayTemplate.templateName, displayTemplate.dateModified);
      });
      setTimeout(() => {
        publishedTemplates.forEach((displayTemplate) => {
          Util.compileTemplate(displayTemplate);
          $('#display-template-layer-css').append(displayTemplate.templateCSS);
        });
        instance.templatesRendered.set(true);
        console.log(Util.timestamp(), 'DisplayTemplateLayer compilation complete');
      }, 1000);
    }
  });
});

/**
 * Template Rendered
 */
Template.DisplayTemplateLayer.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.DisplayTemplateLayer.onDestroyed(() => {
  
});
