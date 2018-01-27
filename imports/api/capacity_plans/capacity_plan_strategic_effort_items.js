import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * CapacityPlanStrategicEffortItems
 * ============================================================================
 */
export const CapacityPlanStrategicEffortItem = new SimpleSchema({
  planId      : {
    type: String
  },
  effortId    : {
    type: String
  },
  title       : {
    type: String
  },
  // Standard tracking fields
  dateCreated : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy   : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified: {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy  : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
  
});

export const CapacityPlanStrategicEffortItems = new Mongo.Collection("capacity_plan_strategic_effort_items");
CapacityPlanStrategicEffortItems.attachSchema(CapacityPlanStrategicEffortItem);
ChangeTracker.trackChanges(CapacityPlanStrategicEffortItems, 'CapacityPlanStrategicEffortItems');

// These are server side only
CapacityPlanStrategicEffortItems.deny({
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
CapacityPlanStrategicEffortItems.helpers({});