import { Mongo }                  from 'meteor/mongo';
import SimpleSchema               from 'simpl-schema';
import { ItemTypes }              from './item_types';
import { ImportedItemWorkPhases } from './imported_item_work_phases';
import { ImportedItemWorkStates } from './imported_item_work_states';
import { Projects }               from '../projects/projects';

/**
 * ============================================================================
 * ImportedItems
 * ============================================================================
 */
export const ImportedItemLink = new SimpleSchema({
  itemId        : {
    type: String
  },
  itemType      : {
    type         : SimpleSchema.Integer,
    allowedValues: _.values(ItemTypes)
  },
  itemIdentifier: {
    type: String
  },
  itemTitle     : {
    type: String
  },
  itemViewUrl   : {
    type    : String,
    optional: true
  },
  linkId        : {
    type    : String,
    optional: true
  },
  linkType      : {
    type    : String,
    optional: true
  },
  dateCreated   : {
    type: Date
  }
});

export const ImportedItem = new SimpleSchema({
  // The source of this item
  integrationId    : {
    type : String,
    index: 1
  },
  // The server this item was imported from
  serverId         : {
    type: String
  },
  // The home project of this item
  projectId        : {
    type: String
  },
  // The team(s) that may own this, plural because it can be indeterminate if an owner is on multiple teams for the same project
  teamId           : {
    type    : Array, // String
    optional: true
  },
  'teamId.$'       : {
    type: String
  },
  // Overall type of this item:
  itemType         : {
    type         : SimpleSchema.Integer,
    allowedValues: _.values(ItemTypes)
  },
  // Primary identifier in the originating system
  identifier       : {
    type : String,
    label: 'Primary identifier for this item in the reference system (issue key, etc)'
  },
  title            : {
    type : String,
    label: 'Summary title for this item'
  },
  description      : {
    type    : String,
    label   : 'Long form description of this item, typically an issue body or such',
    optional: true
  },
  // The imported item document object
  document         : {
    type    : Object,
    blackbox: true
  },
  owner            : {
    type    : String,
    optional: true,
    label   : 'The _id of the Contributor who owns this item'
  },
  // The URL to view this item at in the native tool UI
  viewUrl          : {
    type    : String,
    optional: true,
    label   : 'The URL to view this item at in the tool from which it was imported'
  },
  // The descriptive label of the status of this issue (Assigned, Closed, etc)
  statusLabel      : {
    type    : String,
    optional: true
  },
  // The ID that identifies this status in the server`s status map
  statusId         : {
    type    : String,
    optional: true
  },
  statusHistory    : {
    type    : Array, // Object
    optional: true
  },
  'statusHistory.$': {
    type    : Object,
    blackbox: true
  },
  workPhase        : {
    type         : SimpleSchema.Integer,
    allowedValues: _.values(ImportedItemWorkPhases),
    optional     : true
  },
  workState        : {
    type         : SimpleSchema.Integer,
    allowedValues: _.values(ImportedItemWorkStates),
    optional     : true
  },
  // An array of [_id]s of the release(s) that this item was identified in
  versionsFound    : {
    type    : Array,
    optional: true
  },
  'versionsFound.$': {
    type: String
  },
  // An array of [_id]s of the release(s) that this item was completed in
  versionsFixed    : {
    type    : Array,
    optional: true
  },
  'versionsFixed.$': {
    type: String
  },
  // An array of links to other items
  links            : {
    type    : Array,
    optional: true
  },
  'links.$'        : {
    type: ImportedItemLink
  },
  // Generic Meta-data field
  metadata         : {
    type    : Object,
    blackbox: true,
    optional: true
  },
  // Date the item was created in the originating system
  dateCreated      : {
    type    : Date,
    optional: true,
    label   : 'The date this item was created',
    index   : 1
  },
  // Contributor who created the item in the originating system
  createdBy        : {
    type    : String,
    optional: true,
    label   : 'The _id of the Contributor who created this item'
  },
  // Date the item was last modified in the originating system
  dateModified     : {
    type    : Date,
    optional: true,
    label   : 'The date this item was last modified'
  },
  // Contributor who last modified the item in the originating system
  modifiedBy       : {
    type    : String,
    optional: true,
    label   : 'The _id of the Contributor who last modified this item'
  },
  // Date this item was last imported from the originating system
  lastImported     : {
    type    : Date,
    optional: true
  },
  // Date this item was first imported from the originating system
  firstImported    : {
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
ImportedItems.helpers({
  /**
   * Grab the project
   */
  project () {
    return Projects.findOne(this.projectId)
  },
  
  /**
   * Confirm if this item is still incomplete
   * @returns {boolean}
   */
  isOpen () {
    return this.workState !== ImportedItemWorkStates.workCompleted
  },
  
  /**
   * Confirm if this item is of a particular type
   * @param type
   * @returns {boolean}
   */
  isType (type) {
    return this.itemType === type
  }
});