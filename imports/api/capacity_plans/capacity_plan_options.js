import { Mongo }                    from 'meteor/mongo';
import SimpleSchema                 from 'simpl-schema';
import { SchemaHelpers }            from '../schema_helpers.js';
import { CapacityPlans }            from './capacity_plans';
import { CapacityPlanSprints }      from './capacity_plan_sprints';
import { CapacityPlanSprintBlocks } from './capacity_plan_sprint_blocks';
import { CapacityPlanBlockTypes }   from './capacity_plan_block_types';
import { CapacityPlanSprintLinks }  from './capacity_plan_sprint_links';

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
  startDate   : {
    type    : Date,
    optional: true
  },
  sprintLength: {
    type        : SimpleSchema.Integer,
    defaultValue: 2 * 7 * 24 * 60 * 60 * 1000
  },
  sprintCount : {
    type        : SimpleSchema.Integer,
    defaultValue: 4
  },
  // Store display settings for the team
  userSettings: {
    type    : Object,
    optional: true,
    blackbox: true
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

export const CapacityPlanOptions = new Mongo.Collection('capacity_plan_options');
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

// Auto-manage the sprint records for all options
if (Meteor.isServer) {
  CapacityPlanOptions.after.insert((userId, doc) => {
    //console.log('After Option Insert:', doc);
    let option = CapacityPlanOptions.findOne(doc._id);
    if (option) {
      for (let i = 0; i < option.sprintCount; i++) {
        CapacityPlanSprints.insert({
          planId      : option.planId,
          optionId    : option._id,
          sprintNumber: i,
          startDate   : moment(option.startDate).add(i * option.sprintLength, 'ms').isoWeekday(1).toDate(),
          endDate     : moment(option.startDate).add((i + 1) * option.sprintLength, 'ms').isoWeekday(1).subtract(3, 'days').toDate()
        });
      }
    }
  });
  CapacityPlanOptions.after.update((userId, doc, rawChangedFields) => {
    let sprintFieldsChanged = _.intersection(rawChangedFields, [ 'startDate', 'sprintLength', 'sprintCount' ]);
    //console.log('After Plan Update grooming sprints:', sprintFieldsChanged);
    if (sprintFieldsChanged.length) {
      let option = CapacityPlanOptions.findOne(doc._id);
      if (option) {
        option.groomSprints();
      }
    }
  });
  CapacityPlanOptions.after.remove((userId, doc) => {
    //console.log('After Option Remove:', doc);
    CapacityPlanOptions.remove({
      optionId: doc._id
    });
  });
  
}

/**
 * Helpers
 */
CapacityPlanOptions.helpers({
  /**
   * Get the team settings for the current user
   */
  getUserSettings () {
    let option       = this,
        userSettings = option.userSettings || {};
    
    return userSettings[ Meteor.userId() ] || {}
  },
  /**
   * Update the all of the team settings for a user
   * @param settings
   */
  updateUserSettings (settings) {
    let option       = this,
        userSettings = option.userSettings || {};
    
    // Store the user settings
    userSettings[ Meteor.userId() ] = settings;
    
    if (Meteor.isServer) {
      CapacityPlanOptions.update(option._id, { $set: { userSettings: userSettings } })
    } else {
      Meteor.call('editCapacityPlanOption', option._id, 'userSettings', userSettings, (error) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString())
        }
      })
    }
  },
  /**
   * Get the team settings for the current user
   * @param teamId
   */
  getTeamSettings (teamId) {
    let option       = this,
        userSettings = option.getUserSettings();
    
    if (userSettings[ teamId ]) {
      return userSettings[ teamId ]
    } else {
      return {
        teamId : teamId,
        visible: true,
        order  : option.plan().teams().fetch().findIndex((team) => {
          return team._id === teamId
        })
      }
    }
  },
  /**
   * Get all of the team settings for the current user sorted by display order
   */
  getAllTeamSettings () {
    let option = this;
    
    return option.plan()
        .teams()
        .fetch()
        .map((team) => {
          return option.getTeamSettings(team._id)
        })
        .sort((a, b) => {
          return a.order > b.order ? 1 : -1
        });
  },
  /**
   * Update the settings for a team for a user
   * @param teamId
   * @param teamSettings
   */
  updateTeamSettings (teamId, teamSettings) {
    let option       = this,
        userSettings = option.getUserSettings();
    
    // Update the team settings
    userSettings[ teamId ] = teamSettings;
    
    option.updateUserSettings(userSettings);
  },
  /**
   * Update the team order for this option
   * @param teamId
   * @param newOrder
   */
  updateTeamOrder (teamId, newOrder) {
    let option       = this,
        userSettings = option.getUserSettings(),
        teamSettings, currentIndex;
    
    // Re-index the order to make sure the order is sequential
    teamSettings = option.getAllTeamSettings().map((teamSetting, i) => {
      teamSetting.order = i;
      if (teamSetting.teamId === teamId) {
        currentIndex = i;
      }
      return teamSetting;
    });
    
    // Displace the team currently in the order requested
    if (currentIndex !== undefined) {
      let moveIndex = Math.min(Math.max(parseInt(newOrder) || 0, 0), teamSettings.length);
      
      teamSettings[ moveIndex ].order    = currentIndex;
      teamSettings[ currentIndex ].order = moveIndex;
    }
    
    // Map the team settings back to the user settings object
    teamSettings.sort((a, b) => {
          return a.order > b.order ? 1 : -1
        })
        .forEach((teamSetting, i) => {
          teamSetting.order = i;
          
          userSettings[ teamSetting.teamId ] = teamSetting
        });
    
    option.updateUserSettings(userSettings);
  },
  /**
   * Move a team up in the order
   * @param teamId
   */
  moveTeamUp (teamId) {
    let option       = this,
        teamSettings = option.getTeamSettings(teamId);
    
    option.updateTeamOrder(teamId, teamSettings.order - 1)
  },
  /**
   * Move a team down in the order
   * @param teamId
   */
  moveTeamDown (teamId) {
    let option       = this,
        teamSettings = option.getTeamSettings(teamId);
    
    option.updateTeamOrder(teamId, teamSettings.order + 1)
  },
  /**
   * Toggle team visibility for this option
   * @param teamId
   */
  toggleTeamVisibility (teamId) {
    let option       = this,
        teamSettings = option.getTeamSettings(teamId);
    
    // Set the visible flag
    teamSettings.visible = !teamSettings.visible;
    
    // Store the user settings
    option.updateTeamSettings(teamId, teamSettings);
  },
  /**
   * Get the plan this option belongs to
   */
  plan () {
    return CapacityPlans.findOne(this.planId)
  },
  
  /**
   * Get the sprints for this option
   */
  sprints () {
    return CapacityPlanSprints.find({ optionId: this._id }, { sort: { sprintNumber: 1 } })
  },
  
  /**
   * Get a sprint for this plan by sprint number
   * @param sprintNumber
   */
  sprint (sprintNumber) {
    return CapacityPlanSprints.findOne({ optionId: this._id, sprintNumber: sprintNumber })
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
   * Get the releases in this option
   */
  releases () {
    let option = this;
    return _.uniq(CapacityPlanSprintLinks.find({
          optionId  : option._id,
          targetType: CapacityPlanBlockTypes.release
        }, { sort: { targetSprint: 1 } })
        .map((link) => {
          //console.log('CapacityPlanOptions.releases found a release link to block', link.targetId);
          return link.targetId
        }))
        .map((blockId) => {
          let releaseBlock = CapacityPlanSprintBlocks.findOne(blockId);
          if (releaseBlock) {
            //console.log('CapacityPlanOptions.releases loading release block:', blockId, releaseBlock.dataRecord());
            return releaseBlock.dataRecord()
          } else {
            console.error('CapacityPlanOptions.releases unable to load release block:', blockId);
          }
        })
        .filter((release) => {
          return release !== undefined
        });
  },
  
  /**
   * Make sure the correct sprints exist
   */
  groomSprints () {
    let option = this;
    
    CapacityPlanSprints.remove({
      optionId      : option._id,
      sprintNumber: { $gte: option.sprintCount }
    });
    
    for (let i = 0; i < option.sprintCount; i++) {
      CapacityPlanSprints.upsert({
        optionId    : option._id,
        sprintNumber: i
      }, {
        $set: {
          planId      : option.planId,
          optionId    : option._id,
          sprintNumber: i,
          startDate   : moment(option.startDate).add(i * option.sprintLength, 'ms').isoWeekday(1).toDate(),
          endDate     : moment(option.startDate).add((i + 1) * option.sprintLength, 'ms').isoWeekday(1).subtract(3, 'days').toDate()
        }
      });
    }
  },
  
  /**
   * Make sure that the links for a contributor make sense
   * @param contributorId
   */
  healContributorLinks (contributorId) {
    console.log('CapacityPlanOptions.healContributorLinks:', contributorId);
    let option        = this,
        blockCriteria = { optionId: option._id, dataId: contributorId },
        sprints       = _.uniq(CapacityPlanSprintBlocks.find(blockCriteria, { sort: { sprintNumber: 1 } }).map((d) => {
          return d.sprintNumber
        }));
    
    // Remove any links from this contributor to a different sprint than the first one
    CapacityPlanSprintBlocks.find(blockCriteria).forEach((block) => {
      CapacityPlanSprintLinks.find({
        $or: [
          { sourceId: block._id },
          { targetId: block._id }
        ]
      }).forEach((link) => {
        CapacityPlanSprintLinks.remove(link._id)
      })
    });
    
    // Handle the links from the contributors
    blockCriteria.sprintNumber = sprints[ 0 ];
    let firstSprintBlocks      = CapacityPlanSprintBlocks.find(blockCriteria).fetch();
    firstSprintBlocks.forEach((block) => {
      CapacityPlanSprintLinks.insert({
        planId       : block.planId,
        optionId     : block.optionId,
        sourceId     : contributorId,
        sourceType   : CapacityPlanBlockTypes.contributor,
        targetId     : block._id,
        targetSprint : block.sprintNumber,
        targetType   : block.blockType,
        autoGenerated: true
      });
    });
    
    // Iterate through the sprints looking forward (so don't consider the last one)
    if (sprints.length > 1) {
      sprints.slice(0, -1).forEach((thisSprint, i) => {
        let nextSprint = sprints[ i + 1 ];
        
        // Get all of the blocks for this sprint
        blockCriteria.sprintNumber = thisSprint;
        let sprintBlocks           = CapacityPlanSprintBlocks.find(blockCriteria).fetch().map((block) => {
          if (block.parent()) {
            // Make sure the order is up do date
            block.parent().reIndexSiblingOrder();
            block.parentOrder = block.parent().order
          } else {
            block.parentOrder = 0
          }
          return block
        }).sort((a, b) => {
          return a.parentOrder > b.parentOrder
        });
        
        // Get the blocks in the next sprint
        blockCriteria.sprintNumber = nextSprint;
        let nextSprintBlocks       = CapacityPlanSprintBlocks.find(blockCriteria).fetch().map((block) => {
          if (block.parent()) {
            // Make sure the order is up do date
            block.parent().reIndexSiblingOrder();
            block.parentOrder = block.parent().order
          } else {
            block.parentOrder = 0
          }
          return block
        }).sort((a, b) => {
          return a.parentOrder > b.parentOrder
        });
        
        //console.log('healContributorLinks analyzing sprint:', thisSprint, nextSprint, sprintBlocks, nextSprintBlocks);
        
        // Analyze each block in this sprint
        sprintBlocks.forEach((block, blockIndex) => {
          // Check for an unlinked target
          let unlinkedTarget = nextSprintBlocks.find((block) => {
            return block.targetLinks().count() === 0
          });
          
          // Link to this 
          if (unlinkedTarget) {
            //console.info('CapacityPlanOptions.healContributorLinks creating a link to an unlinked target in the next sprint:', block._id, unlinkedTarget._id, unlinkedTarget.sprintNumber);
            CapacityPlanSprintLinks.insert({
              planId       : block.planId,
              optionId     : block.optionId,
              sourceId     : block._id,
              sourceSprint : block.sprintNumber,
              sourceType   : block.blockType,
              targetId     : unlinkedTarget._id,
              targetSprint : unlinkedTarget.sprintNumber,
              targetType   : unlinkedTarget.blockType,
              autoGenerated: true
            });
          } else {
            let nextSprintBlock = nextSprintBlocks.length < blockIndex ? nextSprintBlocks[ blockIndex ] : nextSprintBlocks[ nextSprintBlocks.length - 1 ];
            //console.info('CapacityPlanOptions.healContributorLinks creating a link to the next sprint:', block._id, nextSprintBlock._id, nextSprintBlock.sprintNumber);
            CapacityPlanSprintLinks.insert({
              planId       : block.planId,
              optionId     : block.optionId,
              sourceId     : block._id,
              sourceSprint : block.sprintNumber,
              sourceType   : block.blockType,
              targetId     : nextSprintBlock._id,
              targetSprint : nextSprintBlock.sprintNumber,
              targetType   : nextSprintBlock.blockType,
              autoGenerated: true
            });
          }
        });
        
        // Check the next sprint for any orphaned blocks
        nextSprintBlocks.forEach((block, blockIndex) => {
          //console.log('healContributorLinks analyzing next sprint:', nextSprint, nextSprintBlocks);
          if (!block.targetLinks().count()) {
            // Pick a source link
            let sourceBlock = blockIndex < sprintBlocks.length ? sprintBlocks[ blockIndex ] : sprintBlocks[ sprintBlocks.length - 1 ];
            //console.info('CapacityPlanOptions.healContributorLinks creating front the previous sprint:', sourceBlock._id, block._id, block.sprintNumber);
            
            // Create a link so it's not orphaned
            CapacityPlanSprintLinks.insert({
              planId       : block.planId,
              optionId     : block.optionId,
              sourceId     : sourceBlock._id,
              sourceSprint : sourceBlock.sprintNumber,
              sourceType   : sourceBlock.blockType,
              targetId     : block._id,
              targetSprint : block.sprintNumber,
              targetType   : block.blockType,
              autoGenerated: true
            });
          }
        });
      })
    }
  },
  
  /**
   * Make sure the release link for an effort always emanates from the last block for an effort
   */
  healReleaseLinks (effortId, ignoreBlockId) {
    let option         = this,
        blockCriteria  = { optionId: option._id, dataId: effortId },
        strictCriteria = { optionId: option._id, dataId: effortId };
    
    // Optionally ignore a block if it's about to be removed
    if (ignoreBlockId) {
      strictCriteria._id = { $ne: ignoreBlockId }
    }
    
    let sprints = _.uniq(CapacityPlanSprintBlocks.find(strictCriteria, { sort: { sprintNumber: 1 } }).map((d) => {
      return d.sprintNumber
    }));
    
    //console.log('healReleaseLinks effortId, sprints:', effortId, sprints);
    // Get the maximum sprint number for this effort
    let effortBlocks = CapacityPlanSprintBlocks.find(blockCriteria).fetch(),
        strictBlocks = CapacityPlanSprintBlocks.find(strictCriteria).fetch(),
        finalSprint  = sprints[ sprints.length - 1 ];
    
    //console.log('healReleaseLinks finalSprint, effortBlocks', finalSprint, effortBlocks, strictBlocks);
    
    // Determine the correct release target
    let targetReleaseLinks = _.uniq(_.flatten(effortBlocks.map((block) => {
      return block.sourceLinks().fetch()
    })), (link) => {
      return link.targetId
    });
    //console.log('healReleaseLinks targetReleaseLinks:', targetReleaseLinks);
    
    // If there are no target releases, nothing to heal
    if (targetReleaseLinks.length) {
      let chosenReleaseBlockId = targetReleaseLinks[ 0 ].targetId;
      //console.log('healReleaseLinks chosenReleaseBlockId:', chosenReleaseBlockId);
      
      // Go through the non-final blocks and remove any release links
      blockCriteria.sprintNumber = { $lt: finalSprint };
      CapacityPlanSprintBlocks.find(blockCriteria).forEach((block) => {
        block.sourceLinks().forEach((link) => {
          CapacityPlanSprintLinks.remove(link._id)
        })
      });
      blockCriteria.sprintNumber = { $gt: finalSprint };
      CapacityPlanSprintBlocks.find(blockCriteria).forEach((block) => {
        block.sourceLinks().forEach((link) => {
          CapacityPlanSprintLinks.remove(link._id)
        })
      });
      
      // Get the block that should link to the release
      strictCriteria.sprintNumber = finalSprint;
      let finalBlock              = CapacityPlanSprintBlocks.findOne(strictCriteria);
      
      // Validate any remaining links
      finalBlock.sourceLinks().forEach((link, i) => {
        if (link.targetId !== chosenReleaseBlockId || i > 0) {
          CapacityPlanSprintLinks.remove(link._id)
        }
      });
      
      // Make sure there is a link from the final block
      if (finalBlock.sourceLinks().count() === 0) {
        // Insert a release link to replace the ones that were removed
        //console.log('healReleaseLinks adding a link to the chosen block:', chosenReleaseBlockId);
        let releaseBlock = CapacityPlanSprintBlocks.findOne(chosenReleaseBlockId);
        releaseBlock.addLink(finalBlock._id, finalBlock.sprintNumber, CapacityPlanBlockTypes.effort);
        
      }
    }
  }
});