import { Mongo }         from 'meteor/mongo';
import SimpleSchema      from 'simpl-schema';
import { Util }          from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * BacklogItems
 * ============================================================================
 */
export const BacklogItem = new SimpleSchema({});

export const BacklogItems = new Mongo.Collection("backlog_items");
BacklogItems.attachSchema(BacklogItem);

/**
 * Helpers
 */
BacklogItems.helpers({});