import { Mongo }                    from 'meteor/mongo';
import SimpleSchema                 from 'simpl-schema';
import { SchemaHelpers }            from '../schema_helpers';
import { CapacityPlanSprintLinks }  from './capacity_plan_sprint_links';
import { CapacityPlanSprintBlocks } from './capacity_plan_sprint_blocks';
import { Releases }                 from '../releases/releases';
import { CapacityPlanOptions }      from './capacity_plan_options';

/**
 * ============================================================================
 * CapacityPlanReleases
 * ============================================================================
 */
export const CapacityPlanRelease = new SimpleSchema({
  optionId    : {
    type: String
  },
  releaseId   : {
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

export const CapacityPlanReleases = new Mongo.Collection('capacity_plan_releases');
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
  option () {
    return CapacityPlanOptions.findOne(this.optionId)
  },
  
  /**
   * Get the release this is mapped to
   */
  release () {
    return Releases.findOne(this.releaseId)
  },
  
  /**
   * Get the title of the release this maps to
   */
  title () {
    let release = this.release();
    if (release) {
      return release.title
    }
  },
  
  /**
   * Get the version number of the release this maps to
   */
  versionNumber () {
    let release = this.release();
    if (release) {
      return release.versionNumber
    }
  },
  
  /**
   * Determine the release date for an option
   */
  releaseDate () {
    let release      = this,
        releaseBlock = CapacityPlanSprintBlocks.findOne({ optionId: release.optionId, dataId: release._id });
    
    if (releaseBlock) {
      let lastSprint = releaseBlock.targetLinks()
          .fetch()
          .reduce((sprintNumber, releaseLink) => {
            let effortBlock = releaseLink.source();
            if (effortBlock) {
              return effortBlock.sprintNumber > sprintNumber ? effortBlock.sprintNumber : sprintNumber
            } else {
              return sprintNumber
            }
          }, 0);
      
      if (lastSprint !== undefined) {
        lastSprint = Math.min(this.option().sprints().count() - 1, lastSprint);
        return this.option().sprint(lastSprint).endDate
      }
    }
  },
  
  /**
   * Get the sprint records for a given option
   */
  sprints () {
    let release = this;
    
    return _.uniq(_.flatten(release.efforts(release.optionId).map((effort) => {
          return CapacityPlanSprintBlocks.find({
            optionId: release.optionId,
            dataId  : effort._id
          }).map((effortBlock) => {
            return effortBlock.sprintNumber
          });
        })))
        .sort()
        .map((sprintNumber) => {
          return release.option().sprint(sprintNumber)
        });
  },
  
  /**
   * Get the number of sprints that have work for this release
   */
  sprintCount () {
    return this.sprints().length;
  },
  
  /**
   * Determine the contents of a release for a given option
   */
  efforts () {
    let release      = this,
        releaseBlock = CapacityPlanSprintBlocks.findOne({ optionId: release.optionId, dataId: release._id });
    
    if (releaseBlock) {
      return CapacityPlanSprintLinks.find({
            optionId: release.optionId,
            targetId: releaseBlock._id
          })
          // The source of the links to this release's block are the contents of this release
          .map((link) => {
            //console.log('CapacityPlanOptions.releases found a release link to block', link.targetId);
            let source = link.source();
            if (source) {
              // The data record for the source links will be the strategic effort record
              return source.dataRecord()
            }
          })
          // Filter any orphaned blocks to be fault tolerant
          .filter((effort) => {
            return effort !== undefined
          })
          // Sort by title
          .sort((effortA, effortB) => {
            return effortA.title.toLowerCase() > effortB.title.toLowerCase() ? 1 : -1
          });
    } else {
      return []
    }
  },
  
  /**
   * Determine the release content for this release for a given option
   */
  contentEfforts () {
    return this.efforts().filter((effort) => {
      return effort.isReleaseContent
    })
  }
});