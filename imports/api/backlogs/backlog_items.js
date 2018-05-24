import { Mongo }                           from 'meteor/mongo';
import SimpleSchema                        from 'simpl-schema';
import { Util }                            from '../util.js';
import { SchemaHelpers }                   from '../schema_helpers.js';
import { BacklogItemCategories }           from './backlog_item_categories';
import { BacklogItemResourceRequirements } from './backlog_item_resource_requirements';

/**
 * ============================================================================
 * BacklogItems
 * ============================================================================
 */
export const BacklogItem = new SimpleSchema({
  title         : {
    type: String
  },
  isCommitted   : {
    type        : Boolean,
    defaultValue: false
  },
  categoryId    : {
    type    : String,
    optional: true
  },
  backlogIds    : {
    type: Array
  },
  'backlogIds.$': {
    type    : String,
    blackbox: true
  },
  backlogOrders : {
    type    : Object,
    blackbox: true,
    optional: true
  },
  metadata      : {
    type    : Object,
    blackbox: true,
    optional: true
  },
  // Standard tracking fields
  dateCreated   : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy     : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified  : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy    : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const BacklogItems = new Mongo.Collection("backlog_items");
BacklogItems.attachSchema(BacklogItem);

// These are server side only
BacklogItems.deny({
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
BacklogItems.helpers({
  /**
   * Set the backlog order for this item for a specific backlog
   * @param backlogId
   * @param order
   */
  setBacklogOrder (backlogId, order) {
    let item   = this,
        update = {};
    
    update[ 'backlogOrders.' + backlogId ] = order;
    
    BacklogItems.update(item._id, { $set: update })
  },
  
  /**
   * Get the backlog order for this item for a specific backlog
   * @param backlogId
   * @returns {number}
   */
  getBacklogOrder (backlogId) {
    let item = this;
    
    return (this.backlogOrders && this.backlogOrders[ backlogId ]) || 0
  },
  
  /**
   * Get the resource requirements for this item
   */
  resourceRequirements () {
    let item = this;
    
    return BacklogItemResourceRequirements.find({ backlogItemId: item._id })
  },
  
  /**
   * Get the category record for this item
   */
  category () {
    if (this.categoryId) {
      return BacklogItemCategories.findOne(this.categoryId)
    }
  }
});