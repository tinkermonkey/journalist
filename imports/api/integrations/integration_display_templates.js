import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ChangeTracker } from 'meteor/austinsand:roba-change-tracker';
import { SchemaHelpers } from '../schema_helpers';

/**
 * ============================================================================
 * IntegrationDisplayTemplates
 * ============================================================================
 */
export const IntegrationDisplayTemplate = new SimpleSchema({
  title            : {
    type: String
  },
  templateName     : {
    type: String
  },
  templateLayout   : {
    type    : String,
    optional: true
  },
  templateHelpers  : {
    type    : String,
    optional: true
  },
  templateEvents   : {
    type    : String,
    optional: true
  },
  templateCreated  : {
    type    : String,
    optional: true
  },
  templateRendered : {
    type    : String,
    optional: true
  },
  templateDestroyed: {
    type    : String,
    optional: true
  },
  lastPublished: {
    type: Date,
    optional: true
  },
  // Standard tracking fields
  dateCreated      : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy        : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified     : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy       : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const IntegrationDisplayTemplates = new Mongo.Collection('integration_display_templates');
IntegrationDisplayTemplates.attachSchema(IntegrationDisplayTemplate);
ChangeTracker.trackChanges(IntegrationDisplayTemplates, 'IntegrationDisplayTemplates');

// These are server side only
IntegrationDisplayTemplates.deny({
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
IntegrationDisplayTemplates.helpers({
  /**
   * Compile the template
   */
  compile(){
    let displayTemplate = this;
    Template[displayTemplate.templateName] = new Template(displayTemplate.templateName, eval(SpacebarsCompiler.compile(displayTemplate.templateLayout, { isTemplate: true })));
    Template[displayTemplate.templateName].helpers(eval('new Object(' + displayTemplate.templateHelpers + ')'));
    Template[displayTemplate.templateName].events(eval('new Object(' + displayTemplate.templateEvents + ')'));
    Template[displayTemplate.templateName].onCreated(new Function(displayTemplate.templateCreated));
    Template[displayTemplate.templateName].onRendered(new Function(displayTemplate.templateRendered));
    Template[displayTemplate.templateName].onDestroyed(new Function(displayTemplate.templateDestroyed));
    return Template[displayTemplate.templateName]
  }
});