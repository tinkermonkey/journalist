import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Util } from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * Projects
 * ============================================================================
 */
export const Project = new SimpleSchema({
  title: {
    type: String
  },
  // Contributor that is the primary owner of this project
  owner: {
    type: String,
    optional: true
  },
  // Standard tracking fields
  dateCreated: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const Projects = new Mongo.Collection("projects");
Projects.attachSchema(Project);

/**
 * Helpers
 */
Projects.helpers({});