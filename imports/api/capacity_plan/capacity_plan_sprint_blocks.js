import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Auth } from '../auth';
import { CapacityPlanBlockTypes } from './capacity_plan_block_types';
import { Contributors } from '../contributors/contributors';
import { CapacityPlanStrategicEfforts } from './capacity_plan_strategic_efforts';
import { CapacityPlanStrategicEffortItems } from './capacity_plan_strategic_effort_items';
import { CapacityPlanSprintLinks } from './capacity_plan_sprint_links';

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
  },
  chartData   : {
    type    : Object,
    blackbox: true
  }
});

export const CapacityPlanSprintBlocks = new Mongo.Collection("capacity_plan_sprint_blocks");
CapacityPlanSprintBlocks.attachSchema(CapacityPlanSprintBlock);
ChangeTracker.trackChanges(CapacityPlanSprintBlocks, 'CapacityPlanSprintBlocks');


// Auto-manage the sprint records for all options
if (Meteor.isServer) {
  CapacityPlanSprintBlocks.after.remove((userId, doc) => {
    // Remove any links pointing to this block
    CapacityPlanSprintLinks.remove({
      $or: [
        { sourceId: doc._id },
        { targetId: doc._id }
      ]
    });

    // Remove any child blocks
    CapacityPlanSprintBlocks.remove({
      parentId: doc._id
    });
  });
}

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
  },
  
  /**
   * Create a child block
   * @param blockType
   * @param dataId
   * @param chartData
   */
  addChild (blockType, dataId, chartData) {
    let blockId = CapacityPlanSprintBlocks.insert({
      planId      : this.planId,
      optionId    : this.optionId,
      sprintNumber: this.sprintNumber,
      order       : this.childCount(),
      dataId      : dataId,
      blockType   : blockType,
      parentId    : this._id,
      chartData   : chartData || {}
    });
    
    return CapacityPlanSprintBlocks.findOne(blockId)
  },
  
  /**
   * Add a link to this block
   */
  addLink (sourceId) {
    let linkId = CapacityPlanSprintLinks.insert({
      planId  : this.planId,
      optionId: this.optionId,
      sourceId: sourceId,
      targetId: this._id
    });
    
    return CapacityPlanSprintLinks.findOne(linkId)
  }
});