import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { CapacityPlanStrategicEffortItems } from './capacity_plan_strategic_effort_items';
import { ImportedItemCrumbs } from '../imported_items/imported_item_crumbs';
import { CapacityPlanSprintLinks } from './capacity_plan_sprint_links';

/**
 * ============================================================================
 * CapacityPlanStrategicEffort
 * ============================================================================
 */
export const CapacityPlanStrategicEffort = new SimpleSchema({
  planId        : {
    type: String
  },
  itemIdentifier: {
    type    : String,
    optional: true
  },
  title         : {
    type: String
  },
  color         : {
    type: String
  },
  // Standard tracking fields
  dateCreated   : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy     : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified  : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy    : {
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
    if (this.itemIdentifier) {
      let item = ImportedItemCrumbs.findOne({ identifier: this.itemIdentifier });
      return item && item.title || this.title
    } else {
      return this.title
    }
  },
  linkedItemCrumb(){
    if (this.itemIdentifier) {
      return ImportedItemCrumbs.findOne({ identifier: this.itemIdentifier })
    }
  },
  /**
   * If this is linked to an item, service the linked items and make sure they're in sync
   */
  crossReferenceLinkedItems(){
    if (this.itemIdentifier) {
      this.linkedItemCrumb();
    }
  }
});