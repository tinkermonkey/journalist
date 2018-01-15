import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ChangeTracker } from 'meteor/austinsand:roba-change-tracker';
import { SchemaHelpers } from '../schema_helpers';
import { DisplayTemplateGroups } from './display_template_groups';

/**
 * ============================================================================
 * DisplayTemplates
 * ============================================================================
 */
export const DisplayTemplate = new SimpleSchema({
  templateName     : {
    type : String,
    regEx: /^[\w\d]+$/i
  },
  parentGroup      : {
    type    : String,
    optional: true
  },
  templateLayout   : {
    type    : String,
    optional: true
  },
  templateCSS   : {
    type    : String,
    optional: true
  },
  templatePreamble  : {
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
  previewContext   : {
    type    : String,
    optional: true
  },
  lastPublished    : {
    type    : Date,
    optional: true
  },
  publishedVersion : {
    type    : Number,
    optional: true
  },
  currentVersion   : {
    type: Number,
    autoValue () {
      if (this.userId && this.operator !== '$pull') {
        if (!this.isSet) {
          return { $inc: 1 }
        }
      }
    }
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

export const DisplayTemplates = new Mongo.Collection('display_templates');
DisplayTemplates.attachSchema(DisplayTemplate);
ChangeTracker.trackChanges(DisplayTemplates, 'DisplayTemplates');

// These are server side only
DisplayTemplates.deny({
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
DisplayTemplates.helpers({
  group () {
    return DisplayTemplateGroups.findOne(this.parentGroup)
  },
  groupPath () {
    let group = this.group();
    if (group) {
      return [ group ].concat(group.parentList())
    }
  }
});