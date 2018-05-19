import { Mongo }         from 'meteor/mongo';
import SimpleSchema      from 'simpl-schema';
import { Util }          from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * Backlogs
 * ============================================================================
 */
export const Backlog = new SimpleSchema({});

export const Backlogs = new Mongo.Collection("backlogs");
Backlogs.attachSchema(Backlog);

/**
 * Helpers
 */
Backlogs.helpers({});