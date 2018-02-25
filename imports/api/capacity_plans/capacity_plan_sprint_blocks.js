import { Mongo }                            from 'meteor/mongo';
import SimpleSchema                         from 'simpl-schema';
import { Auth }                             from '../auth';
import { CapacityPlanBlockTypes }           from './capacity_plan_block_types';
import { Contributors }                     from '../contributors/contributors';
import { CapacityPlanOptions }              from './capacity_plan_options';
import { CapacityPlanReleases }             from './capacity_plan_releases';
import { CapacityPlanStrategicEfforts }     from './capacity_plan_strategic_efforts';
import { CapacityPlanStrategicEffortItems } from './capacity_plan_strategic_effort_items';
import { CapacityPlanSprintLinks }          from './capacity_plan_sprint_links';

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
  // Zero indexed
  sprintNumber: {
    type: Number
  },
  order       : {
    type: SimpleSchema.Integer,
  },
  dataId      : {
    type: String
  },
  blockType   : {
    type         : SimpleSchema.Integer,
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

export const CapacityPlanSprintBlocks = new Mongo.Collection('capacity_plan_sprint_blocks');
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
   * Get the plan option for this block
   */
  option () {
    return CapacityPlanOptions.findOne(this.optionId)
  },
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
      case CapacityPlanBlockTypes.release:
        return CapacityPlanReleases.findOne(block.dataId);
    }
  },
  
  /**
   * Get the child blocks for this block
   */
  children () {
    return CapacityPlanSprintBlocks.find({
      parentId: this._id
    })
  },
  
  /**
   * Get the number of child blocks for this block
   */
  childCount () {
    return this.children().count()
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
  addLink (sourceId, sourceSprint, sourceType) {
    // check for an existing link
    let link = CapacityPlanSprintLinks.findOne({
      planId  : this.planId,
      optionId: this.optionId,
      sourceId: sourceId,
      targetId: this._id,
    });
    if (!link) {
      let linkId = CapacityPlanSprintLinks.insert({
        planId      : this.planId,
        optionId    : this.optionId,
        sourceId    : sourceId,
        sourceSprint: sourceSprint,
        sourceType  : sourceType,
        targetId    : this._id,
        targetSprint: this.sprintNumber,
        targetType  : this.blockType
      });
      
      return CapacityPlanSprintLinks.findOne(linkId)
    } else {
      return link
    }
  },
  
  /**
   * Get the links that emanate from this block
   */
  sourceLinks () {
    return CapacityPlanSprintLinks.find({ sourceId: this._id })
  },
  
  /**
   * Get the links that point to this block
   */
  targetLinks () {
    return CapacityPlanSprintLinks.find({ targetId: this._id })
  },
  
  /**
   * Move this block down in order
   */
  moveUp () {
    let block    = this,
        previous = CapacityPlanSprintBlocks.findOne({
          optionId    : block.optionId,
          sprintNumber: block.sprintNumber,
          parentId    : block.parentId,
          blockType   : block.blockType,
          order       : { $lt: block.order }
        }, { sort: { order: -1 } });
    
    if (previous) {
      CapacityPlanSprintBlocks.update(previous._id, { $set: { order: block.order } });
      CapacityPlanSprintBlocks.update(block._id, { $set: { order: previous.order } });
      this.reIndexSiblingOrder();
    } else {
      console.error('CapacityPlanSprintBlocks.moveUp failed, no previous block found:', CapacityPlanSprintBlocks.find({
        optionId    : block.optionId,
        sprintNumber: block.sprintNumber,
        parentId    : block.parentId,
        blockType   : block.blockType,
        order       : { $lt: block.order }
      }, { sort: { order: -1 } }).fetch())
    }
  },
  
  /**
   * Move this block up in order
   */
  moveDown () {
    let block = this,
        next  = CapacityPlanSprintBlocks.findOne({
          optionId    : block.optionId,
          sprintNumber: block.sprintNumber,
          parentId    : block.parentId,
          blockType   : block.blockType,
          order       : { $gt: block.order }
        }, { sort: { order: 1 } });
    
    if (next) {
      CapacityPlanSprintBlocks.update(next._id, { $set: { order: block.order } });
      CapacityPlanSprintBlocks.update(block._id, { $set: { order: next.order } });
      this.reIndexSiblingOrder();
    } else {
      console.error('CapacityPlanSprintBlocks.moveDown failed, no next block found:', CapacityPlanSprintBlocks.find({
        optionId    : block.optionId,
        sprintNumber: block.sprintNumber,
        parentId    : block.parentId,
        blockType   : block.blockType,
        order       : { $gt: block.order }
      }, { sort: { order: -1 } }).fetch())
    }
  },
  
  /**
   * Update the sprint number
   * @param sprintNumber
   */
  updateSprintNumber (sprintNumber) {
    //console.log('CapacityPlanSprintBlocks.updateSprintNumber:', this._id, this.parentId, sprintNumber);
    let block = this;
    
    CapacityPlanSprintBlocks.update(block._id, { $set: { sprintNumber: sprintNumber } });
    
    // Update the sprint number for all of the children
    block.children().forEach((child) => {
      child.updateSprintNumber(sprintNumber);
    });
    
    // Remove the contributor links as they'll need to be healed
    if (block.blockType === CapacityPlanBlockTypes.contributor) {
      block.sourceLinks().forEach((link) => {
        CapacityPlanSprintLinks.remove(link._id);
      });
      block.targetLinks().forEach((link) => {
        CapacityPlanSprintLinks.remove(link._id);
      });
      
      // Heal the links
      block.option().healContributorLinks(block.dataId)
    } else {
      // Update all of the links sourceSprint and targetSprint
      block.sourceLinks().forEach((link) => {
        CapacityPlanSprintLinks.update(link._id, { $set: { sourceSprint: sprintNumber } });
      });
      block.targetLinks().forEach((link) => {
        CapacityPlanSprintLinks.update(link._id, { $set: { targetSprint: sprintNumber } });
      });
    }
  },
  
  /**
   * Update the block order
   * @param order
   */
  updateOrder (order) {
    CapacityPlanSprintBlocks.update(this._id, { $set: { order: order } })
  },
  
  /**
   * Remove this block
   */
  remove () {
    CapacityPlanSprintBlocks.remove(this._id);
  },
  
  /**
   * Get the parent block
   * @return {any}
   */
  parent () {
    if (this.parentId) {
      return CapacityPlanSprintBlocks.findOne(this.parentId)
    }
  },
  
  /**
   * Get other blocks for the same data id
   */
  cousins () {
    return CapacityPlanSprintBlocks.find({
      optionId: this.optionId,
      dataId  : this.dataId
    }, { sort: { sprintNumber: 1 } })
  },
  
  /**
   * Get all of the sibling blocks
   */
  siblings () {
    return CapacityPlanSprintBlocks.find({
      optionId    : this.optionId,
      sprintNumber: this.sprintNumber,
      parentId    : this.parentId,
      blockType   : this.blockType
    }, { sort: { order: 1 } })
  },
  
  /**
   * Get the number of sibling blocks
   */
  siblingCount () {
    return this.siblings().count()
  },
  
  /**
   * Re-index the order of the siblings to be zero-based and sequential
   */
  reIndexSiblingOrder () {
    this.siblings().fetch().forEach((block, i) => {
      if (block.order !== i) {
        CapacityPlanSprintBlocks.update(block._id, { $set: { order: i } })
      }
    })
  }
});