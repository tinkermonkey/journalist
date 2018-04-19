import { Mongo }                            from 'meteor/mongo';
import SimpleSchema                         from 'simpl-schema';
import { SchemaHelpers }                    from '../schema_helpers.js';
import { CapacityPlanStrategicEffortItems } from './capacity_plan_strategic_effort_items';
import { Contributors }                     from '../contributors/contributors';
import { ContributorTeamRoles }             from '../contributors/contributor_team_roles';
import { ImportedItemCrumbs }               from '../imported_items/imported_item_crumbs';
import { CapacityPlanSprintBlocks }         from './capacity_plan_sprint_blocks';
import { CapacityPlanSprints }              from './capacity_plan_sprints';
import { CapacityPlanBlockTypes }           from './capacity_plan_block_types';

/**
 * ============================================================================
 * CapacityPlanStrategicEffort
 * ============================================================================
 */
export const CapacityPlanStrategicEffort = new SimpleSchema({
  planId          : {
    type: String
  },
  importedItemId  : {
    type    : String,
    optional: true
  },
  title           : {
    type: String
  },
  description     : {
    type    : String,
    optional: true
  },
  color           : {
    type: String
  },
  isReleaseContent: {
    type        : Boolean,
    defaultValue: true
  },
  // Standard tracking fields
  dateCreated     : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy       : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified    : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy      : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const CapacityPlanStrategicEfforts = new Mongo.Collection('capacity_plan_strategic_efforts');
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
  },
  totalEstimate () {
    return this.items().fetch().reduce((total, item) => {
      return parseFloat(item.estimate || 0) + total
    }, 0)
  },
  itemsWithEstimates () {
    return CapacityPlanStrategicEffortItems.find({ effortId: this._id, estimate: { $gt: 0 } }, { sort: { title: 1 } })
  },
  itemTitle () {
    if (this.importedItemId) {
      let item = ImportedItemCrumbs.findOne({ _id: this.importedItemId });
      return item && item.title || this.title
    } else {
      return this.title
    }
  },
  itemDescription () {
    if (this.importedItemId) {
      let item = ImportedItemCrumbs.findOne({ _id: this.importedItemId });
      return item && item.description || this.description
    } else {
      return this.description
    }
  },
  linkedItemCrumb () {
    if (this.importedItemId) {
      return ImportedItemCrumbs.findOne({ _id: this.importedItemId })
    }
  },
  /**
   * If this is linked to an item, service the linked items and make sure they're in sync
   */
  crossReferenceLinkedItems () {
    if (this.importedItemId) {
      this.linkedItemCrumb();
    }
  },
  /**
   * Determine the sprint numbers that this item is being worked for a planned option
   * @param optionId
   */
  sprintNumbers (optionId) {
    let effort = this;
    
    return _.uniq(CapacityPlanSprintBlocks.find({ optionId: optionId, dataId: effort._id })
        .map((effortBlock) => {
          return effortBlock.sprintNumber
        })).sort()
  },
  /**
   * Determine the sprints this item is being worked for a planned option
   * @param optionId
   */
  sprints (optionId) {
    let effort = this;
    
    return CapacityPlanSprints.find({
      optionId    : optionId,
      sprintNumber: { $in: effort.sprintNumbers(optionId) }
    }, { sort: { sprintNumber: 1 } })
  },
  /**
   * Get the list of contributors working on this effort
   * @param optionId
   */
  contributors (optionId) {
    let effort = this;
    
    return _.uniq(_.flatten(CapacityPlanSprintBlocks.find({ optionId: optionId, dataId: effort._id })
        .map((effortBlock) => {
          //console.log('Found an effort block:', effortBlock);
          // Return a list of all of the contributorIds for this effort block
          return effortBlock.children().fetch()
              .filter((block) => {
                //console.log('Filtering child blocks:', block.blockType);
                return block.blockType === CapacityPlanBlockTypes.contributor
              })
              .map((contributorBlock) => {
                //console.log('Found a contributor block:', contributorBlock.dataId);
                return contributorBlock.dataId
              })
        })))
        .map((contributorId) => {
          //console.log('Getting contributor:', contributorId);
          return Contributors.findOne(contributorId)
        })
  },
  
  /**
   * Get the list of contributors in a role working on this effort
   * @param optionId
   * @param roleDefinitionId
   */
  contributorsInRole (optionId, roleDefinitionId) {
    let effort = this;
    
    return effort.contributors(optionId)
        .filter((contributor) => {
          return ContributorTeamRoles.find({ contributorId: contributor._id })
              .fetch()
              .filter((teamRole) => {
                return teamRole.roleDefinition().capacityRole()._id === roleDefinitionId
              }).length > 0
        })
  }
});