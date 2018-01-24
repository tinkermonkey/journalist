import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Auth } from '../auth';
import { CapacityPlanBlockTypes } from './capacity_plan_block_types';
import { Contributors } from '../contributors/contributors';
import { CapacityPlanStrategicEfforts } from './capacity_plan_strategic_efforts';
import { CapacityPlanStrategicEffortItems } from './capacity_plan_strategic_effort_items';

/**
 * ============================================================================
 * CapacityPlanSprintBlock
 * ============================================================================
 */
export const CapacityPlanSprintBlock = new SimpleSchema({
  planId      : {
    type: String
  },
  optionId    : {
    type: String
  },
  sprintNumber: {
    type: Number,
  },
  order       : {
    type: Number,
  },
  dataId      : {
    type: String
  },
  blockType   : {
    type         : Number,
    allowedValues: _.values(CapacityPlanBlockTypes)
  },
  parentId    : {
    type    : String,
    optional: true
  }
});

export const CapacityPlanSprintBlocks = new Mongo.Collection("capacity_plan_sprint_blocks");
CapacityPlanSprintBlocks.attachSchema(CapacityPlanSprintBlock);
ChangeTracker.trackChanges(CapacityPlanSprintBlocks, 'CapacityPlanSprintBlocks');

// Server side only for now
CapacityPlanSprintBlocks.deny({
  remove: Auth.denyIfNotAdmin,
  insert: Auth.denyIfNotAdmin,
  update: Auth.denyIfNotAdmin
});

/**
 * Helpers
 */
CapacityPlanSprintBlocks.helpers({
  /**
   * Fetch the data behind a block
   */
  dataRecord () {
    let block = this;
    switch (block.blockType) {
      case CapacityPlanBlockTypes.effort:
        return CapacityPlanStrategicEfforts.findOne(block.dataId);
      case CapacityPlanBlockTypes.item:
        return CapacityPlanStrategicEffortItems.findOne(block.dataId);
      case CapacityPlanBlockTypes.contributor:
        return Contributors.findOne(block.dataId);
    }
  },
  
  /**
   * Get the number of child blocks for this block
   */
  childCount () {
    return CapacityPlanSprintBlocks.find({
      parentId: this._id
    }).count()
  }
});