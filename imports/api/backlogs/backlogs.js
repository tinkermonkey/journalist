import { Mongo }         from 'meteor/mongo';
import SimpleSchema      from 'simpl-schema';
import { Util }          from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';
import { BacklogItems }  from './backlog_items';

/**
 * ============================================================================
 * Backlogs
 * ============================================================================
 */
export const Backlog = new SimpleSchema({
  title              : {
    type: String
  },
  isPublic           : {
    type        : Boolean,
    defaultValue: false
  },
  publicTemplate     : {
    type    : String,
    optional: true
  },
  teamTemplate       : {
    type    : String,
    optional: true
  },
  tableHeaderTemplate: {
    type    : String,
    optional: true
  },
  tableRowTemplate   : {
    type    : String,
    optional: true
  },
  // Standard tracking fields
  dateCreated        : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy          : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified       : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy         : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const Backlogs = new Mongo.Collection("backlogs");
Backlogs.attachSchema(Backlog);
ChangeTracker.trackChanges(Backlogs, 'Backlogs');

// These are server side only
Backlogs.deny({
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
Backlogs.helpers({
  /**
   * Return a cursor to the sorted filtered items for this backlog
   * @param filter
   * @returns {*}
   */
  items (filter) {
    let sort = {};
    
    filter            = filter || {};
    filter.backlogIds = this._id;
    
    sort[ 'backlogOrders.' + this._id ] = 1;
    
    return BacklogItems.find(filter, { sort: sort })
  },
  
  /**
   * Return all of the committed items for this backlog
   */
  committedItems(){
    return this.items({isCommitted: true})
  },
  
  /**
   * Return all of the committed items for this backlog
   */
  uncommittedItems(){
    return this.items({isCommitted: false})
  }
});