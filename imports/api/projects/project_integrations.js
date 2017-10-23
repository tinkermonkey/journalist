import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Util } from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * ProjectIntegrations
 * ============================================================================
 */
export const ProjectIntegration = new SimpleSchema({});

export const ProjectIntegrations = new Mongo.Collection('project_integrations');
ProjectIntegrations.attachSchema(ProjectIntegration);

// These are server side only
ProjectIntegrations.deny({
  remove() { return true; },
  insert() { return true; },
  update() { return true; }
});

/**
 * Helpers
 */
ProjectIntegrations.helpers({});