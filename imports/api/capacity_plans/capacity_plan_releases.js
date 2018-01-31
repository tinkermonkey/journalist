import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers';
import { CapacityPlans } from './capacity_plans';
import { CapacityPlanSprintLinks } from './capacity_plan_sprint_links';
import { CapacityPlanSprintBlocks } from './capacity_plan_sprint_blocks';

/**
 * ============================================================================
 * CapacityPlanReleases
 * ============================================================================
 */
export const CapacityPlanRelease = new SimpleSchema({
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

export const CapacityPlanReleases = new Mongo.Collection("capacity_plan_releases");
CapacityPlanReleases.attachSchema(CapacityPlanRelease);
ChangeTracker.trackChanges(CapacityPlanReleases, 'CapacityPlanReleases');

// These are server side only
CapacityPlanReleases.deny({
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
CapacityPlanReleases.helpers({
  /**
   * Get the plan this release belongs to
   */
  plan () {
    return CapacityPlans.findOne(this.planId)
  },
  /**
   * Determine the release date for an option
   * @param optionId
   */
  releaseDate (optionId) {
    let release    = this,
        lastSprint = release.efforts(optionId).reduce((sprintNumber, effort) => {
          return effort.sprintNumber > sprintNumber ? effort.sprintNumber : sprintNumber
        }, 0);
    
    if (lastSprint !== undefined) {
      return this.plan().sprint(lastSprint).endDate
    }
  },
  
  /**
   * Get the number of sprints that have work for this release
   * @param optionId
   */
  sprints (optionId) {
    let release = this;
    
    return _.uniq(_.flatten(release.efforts(optionId).map((effort) => {
      return CapacityPlanSprintBlocks.find({ optionId: optionId, dataId: effort._id }).map((effortBlock) => {
        return effortBlock.sprintNumber
      });
    })));
  },
  
  /**
   * Get the number of sprints that have work for this release
   * @param optionId
   */
  sprintCount (optionId) {
    return this.sprints(optionId).length;
  },
  
  /**
   * Determine the contents of a release for a given option
   * @param optionId
   */
  efforts (optionId) {
    let release      = this,
        releaseBlock = CapacityPlanSprintBlocks.findOne({ optionId: optionId, dataId: release._id });
    
    if (releaseBlock) {
      return CapacityPlanSprintLinks.find({
            optionId: optionId,
            targetId: releaseBlock._id
          })
          // The source of the links to this release's block are the contents of this release
          .map((link) => {
            //console.log('CapacityPlanOptions.releases found a release link to block', link.targetId);
            return link.sourceId
          })
          // Get the records from the block _ids
          .map((blockId) => {
            let effortBlock = CapacityPlanSprintBlocks.findOne(blockId);
            if (effortBlock) {
              //console.log('CapacityPlanOptions.releases loading release block:', blockId, effortBlock.dataRecord());
              return effortBlock.dataRecord()
            } else {
              console.error('CapacityPlanReleases.releaseDate unable to load effort block:', blockId);
            }
          })
          // Filter any orphaned blocks to be fault tolerant
          .filter((effort) => {
            return effort !== undefined
          })
          // Sort by title
          .sort((effortA, effortB) => {
            return effortA.title.toLowerCase() > effortB.title.toLowerCase()
          });
    } else {
      return []
    }
  },
  
  /**
   * Determine the release content for this release for a given option
   * @param optionId
   */
  contentEfforts (optionId) {
    return this.efforts(optionId).filter((effort) => {
      return effort.isReleaseContent
    })
  }
});