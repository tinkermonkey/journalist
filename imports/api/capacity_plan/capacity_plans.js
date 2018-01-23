import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { CapacityPlanOptions } from './capacity_plan_options';
import { CapacityPlanStrategicEfforts } from './capacity_plan_strategic_efforts';
import { Teams } from '../teams/teams';

/**
 * ============================================================================
 * CapacityPlans
 * ============================================================================
 */
export const CapacityPlan = new SimpleSchema({
  title       : {
    type: String
  },
  isActive    : {
    type        : Boolean,
    defaultValue: true
  },
  teamIds     : {
    type    : [ String ],
    optional: true
  },
  startDate   : {
    type    : Date,
    optional: true
  },
  sprintLength: {
    type        : Number,
    defaultValue: 2 * 7 * 24 * 60 * 60 * 1000
  },
  sprintCount : {
    type        : Number,
    defaultValue: 4
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

export const CapacityPlans = new Mongo.Collection("capacity_plans");
CapacityPlans.attachSchema(CapacityPlan);
ChangeTracker.trackChanges(CapacityPlans, 'CapacityPlans');

// These are server side only
CapacityPlans.deny({
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
  CapacityPlans.after.update((userId, doc, rawChangedFields) => {
    console.log('After Plan Update:', rawChangedFields);
    if (_.contains(rawChangedFields, 'startDate') || _.contains(rawChangedFields, 'sprintLength') || _.contains(rawChangedFields, 'sprintCount')) {
      let plan = CapacityPlans.findOne(doc.id);
      if(plan){
        plan.groomSprints();
      }
    }
  });
}

/**
 * Helpers
 */
CapacityPlans.helpers({
  options () {
    return CapacityPlanOptions.find({ planId: this._id }, { sort: { title: 1 } })
  },
  efforts () {
    return CapacityPlanStrategicEfforts.find({ planId: this._id }, { sort: { title: 1 } })
  },
  teams () {
    if (this.teamIds) {
      return Teams.find({ _id: { $in: this.teamIds } }, { sort: { title: 1 } })
    } else {
      return []
    }
  },
  teamIdsSorted () {
    return this.teams().map((team) => {
      return team._id
    })
  },
  groomSprints () {
    let plan = this;
    
    plan.options().forEach((option) => {
    
    })
  }
});