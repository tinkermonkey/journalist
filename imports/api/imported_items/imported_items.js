import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
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
  // The home of this item
  projectId    : {
    type: String
  },
  // Overall type of this item:
  itemType     : {
    type         : Number,
    allowedValues: _.values(ItemTypes)
  },
  // Primary identifier in the originating system
  identifier   : {
    type : String,
    label: 'Primary identifier for this item in the reference system (issue key, etc)'
  },
  title        : {
    type : String,
    label: 'Description title for this item'
  },
  description  : {
    type : String,
    label: 'Long for description of this item, typically an issue body or such'
  },
  // The imported item document object
  document     : {
    type    : Object,
    blackbox: true
  },
  // _id of the contributor designated as the owner of this item
  owner        : {
    type    : String,
    optional: true,
    label   : 'The _id of the Contributor who owns this item'
  },
  // Date the item was created in the originating system
  dateCreated  : {
    type    : Date,
    optional: true,
    label   : 'The date this item was created'
  },
  // Contributor who created the item in the originating system
  createdBy    : {
    type    : String,
    optional: true,
    label   : 'The _id of the Contributor who created this item'
  },
  // Date the item was last modified in the originating system
  dateModified : {
    type    : Date,
    optional: true,
    label   : 'The date this item was last modified'
  },
  // Contributor who last modified the item in the originating system
  modifiedBy   : {
    type    : String,
    optional: true,
    label   : 'The _id of the Contributor who last modified this item'
  },
  // Date this item was last imported from the originating system
  lastImported : {
    type    : Date,
    optional: true
  },
  // Date this item was first imported from the originating system
  firstImported: {
    type    : Date,
    optional: true
  }
});

// Create a schema for validating imported items before they're stored
// The omitted fields are added post import processing so they will not be present at import validation
export const ImportedItemTestSchema = new SimpleSchema(_.omit(ImportedItem.schema(), 'integrationId', 'projectId', 'itemType'));

export const ImportedItems = new Mongo.Collection('imported_items');
ImportedItems.attachSchema(ImportedItem);

// These are server side only
ImportedItems.deny({
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
ImportedItems.helpers({});