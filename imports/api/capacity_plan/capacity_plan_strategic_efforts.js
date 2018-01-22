import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { CapacityPlanStrategicEffortItems } from './capacity_plan_strategic_effort_items';

/**
 * ============================================================================
 * CapacityPlanStrategicEffort
 * ============================================================================
 */
export const CapacityPlanStrategicEffort = new SimpleSchema({
  planId      : {
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

export const CapacityPlanStrategicEfforts = new Mongo.Collection("capacity_plan_strategic_efforts");
CapacityPlanStrategicEfforts.attachSchema(CapacityPlanStrategicEffort);
ChangeTracker.trackChanges(CapacityPlanStrategicEfforts, 'CapacityPlanStrategicEfforts');

// These are server side only
CapacityPlanStrategicEfforts.deny({
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
CapacityPlanStrategicEfforts.helpers({
  items () {
    return CapacityPlanStrategicEffortItems.find({ effortId: this._id }, { sort: { title: 1 } })
  }
});