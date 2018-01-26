import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { CapacityPlans } from './capacity_plans';
import { CapacityPlanSprints } from './capacity_plan_sprints';
import { CapacityPlanSprintBlocks } from './capacity_plan_sprint_blocks';
import { CapacityPlanSprintLinks } from './capacity_plan_sprint_links';

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
  },
  
  /**
   * Make sure that the links for a contributor make sense
   * @param contributorId
   */
  healContributorLinks (contributorId) {
    let option        = this,
        sprints       = option.sprints().fetch(),
        blockCriteria = { optionId: option._id, dataId: contributorId },
        firstSprint   = CapacityPlanSprintBlocks.findOne(blockCriteria, { sort: { sprintNumber: 1 } }),
        lastSprint    = CapacityPlanSprintBlocks.findOne(blockCriteria, { sort: { sprintNumber: -1 } }),
        thisSprint;
    
    console.log('healContributorLinks:', contributorId, firstSprint, lastSprint);
    
    if (firstSprint && lastSprint && firstSprint.sprintNumber !== lastSprint.sprintNumber) {
      // Iterate through the sprints looking forward (so don't consider the last one)
      for (thisSprint = firstSprint.sprintNumber; thisSprint < lastSprint.sprintNumber - 1; thisSprint++) {
        // Get all of the blocks for this sprint
        blockCriteria.sprintNumber = thisSprint;
        let sprintBlocks           = CapacityPlanSprintBlocks.find(blockCriteria).fetch();
        
        // Get the blocks in the next sprint
        blockCriteria.sprintNumber = { $gt: thisSprint };
        let nextSprint             = CapacityPlanSprintBlocks.findOne(blockCriteria, { sort: { sprintNumber: 1 } }).sprintNumber;
        blockCriteria.sprintNumber = nextSprint;
        let nextSprintBlocks       = CapacityPlanSprintBlocks.find(blockCriteria).fetch();
        
        console.log('healContributorLinks analyzing sprint:', thisSprint, nextSprint, sprintBlocks, nextSprintBlocks);
        
        // Multiple blocks for this sprint?
        //if (sprintBlocks.length > 1) {
        //if (nextSprintBlocks.length === 1) {
        sprintBlocks.forEach((block) => {
          // Remove any links from this sprint to a different sprint than the next
          CapacityPlanSprintLinks.find({ sourceId: block._id, targetSprint: { $gt: nextSprint } }).forEach((link) => {
            CapacityPlanSprintLinks.remove(link._id);
          });
          
          // Make sure there is a link from this sprint to the next
          if (!CapacityPlanSprintLinks.find({ sourceId: block._id, targetSprint: nextSprint }).count()) {
            // Create one!
            console.log('Inserting a link because a block has no link forward');
            CapacityPlanSprintLinks.insert({
              planId      : block.planId,
              optionId    : block.optionId,
              sourceId    : block._id,
              sourceSprint: block.sprintNumber,
              targetId    : nextSprintBlocks[ 0 ]._id,
              targetSprint: nextSprint
            });
          } else {
            console.log('Block has links forward:', CapacityPlanSprintLinks.find({ sourceId: block._id, targetSprint: nextSprint })
                .fetch());
            
          }
        })
        
        //}
        //}
      }
    }
  }
});