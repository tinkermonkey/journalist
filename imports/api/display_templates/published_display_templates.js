import { Mongo } from 'meteor/mongo';

export const PublishedDisplayTemplates = new Mongo.Collection('published_display_templates');

// These are server side only
PublishedDisplayTemplates.deny({
  remove () {
    return true;
  },
  insert () {
    return true;
  },
  update () {
    return true;
  }
});

/**
 * Helpers
 */
PublishedDisplayTemplates.helpers({
  /**
   * Compile the template
   */
  compile () {
    let displayTemplate                      = this;
    Template[ displayTemplate.templateName ] = new Template(displayTemplate.templateName, eval(SpacebarsCompiler.compile(displayTemplate.templateLayout, { isTemplate: true })));
    Template[ displayTemplate.templateName ].helpers(eval('new Object(' + displayTemplate.templateHelpers + ')'));
    Template[ displayTemplate.templateName ].events(eval('new Object(' + displayTemplate.templateEvents + ')'));
    Template[ displayTemplate.templateName ].onCreated(new Function(displayTemplate.templateCreated));
    Template[ displayTemplate.templateName ].onRendered(new Function(displayTemplate.templateRendered));
    Template[ displayTemplate.templateName ].onDestroyed(new Function(displayTemplate.templateDestroyed));
    return Template[ displayTemplate.templateName ]
  }
});