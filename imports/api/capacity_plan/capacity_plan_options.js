import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { CapacityPlans } from './capacity_plans';
import { CapacityPlanSprints } from './capacity_plan_sprints';
import { CapacityPlanSprintBlocks } from './capacity_plan_sprint_blocks';

/**
 * ============================================================================
 * CapacityPlanOption
 * ============================================================================
 */
export const CapacityPlanOption = new SimpleSchema({
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

export const CapacityPlanOptions = new Mongo.Collection("capacity_plan_options");
CapacityPlanOptions.attachSchema(CapacityPlanOption);
ChangeTracker.trackChanges(CapacityPlanOptions, 'CapacityPlanOptions');

// These are server side only
CapacityPlanOptions.deny({
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
CapacityPlanOptions.helpers({
  plan () {
    return CapacityPlans.findOne(this.planId)
  },
  sprints () {
    return CapacityPlanSprints.find({ planId: this.planId }, { sort: { sprintNumber: 1 } })
  },
  /**
   * Get all of the blocks for a sprint of a specific type
   * @param sprintNumber
   * @param blockType
   * @param parentId
   */
  sprintBlocks (sprintNumber, blockType, parentId) {
    return CapacityPlanSprintBlocks.find({
      optionId    : this._id,
      sprintNumber: sprintNumber,
      blockType   : blockType,
      parentId    : parentId
    }, { sort: { order: 1 } })
  },
  
  /**
   * Find a specific sprint block
   */
  sprintBlock (sprintNumber, dataId, parentId) {
    let option = this;
    return CapacityPlanSprintBlocks.findOne({
      optionId    : option._id,
      sprintNumber: sprintNumber,
      dataId      : dataId,
      parentId    : parentId
    })
  }
});