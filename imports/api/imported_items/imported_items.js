import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Util } from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';
import { ItemTypes } from './item_types';

/**
 * ============================================================================
 * ImportedItems
 * ============================================================================
 */
export const ImportedItem = new SimpleSchema({
  // The source of this item
  integrationId: {
    type: String
  },
  // Overall type of this item:
  itemType: {
    type: Number,
    allowedValues: _.values(ItemTypes)
  },
  // Primary identifier in the originating system
  identifier: {
    type: String
  },
  title: {
    type: String
  },
  description: {
    type: String
  },
  // The imported item document object
  document: {
    type: Object,
    blackbox: true
  },
  // _id of the contributor designated as the owner of this item
  owner: {
    type: String,
    optional: true
  },
  // Date the item was created in the originating system
  dateCreated: {
    type: Date,
    optional: true
  },
  // Contributor who created the item in the originating system
  createdBy: {
    type: String,
    optional: true
  },
  // Date the item was last modified in the originating system
  dateModified: {
    type: Date,
    optional: true
  },
  // Contributor who last modified the item in the originating system
  modifiedBy: {
    type: String,
    optional: true
  },
  // Date this item was last imported from the originating system
  lastImported: {
    type: Date,
    optional: true
  },
  // Date this item was first imported from the originating system
  firstImported: {
    type: Date,
    optional: true
  }
});

export const ImportedItems = new Mongo.Collection('imported_items');
ImportedItems.attachSchema(ImportedItem);

// These are server side only
ImportedItems.deny({
  remove() { return true; },
  insert() { return true; },
  update() { return true; }
});

/**
 * Helpers
 */
ImportedItems.helpers({});