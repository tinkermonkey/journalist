import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { CapacityPlans } from './capacity_plans';
import { CapacityPlanOptionSprints } from './capacity_plan_option_sprints';

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
    return false;
  }
});

// Auto-manage the sprint records for options
if (Meteor.isServer) {
  CapacityPlanOptions.after.insert((userId, doc) => {
    //console.log('After Option Insert:', doc);
    let plan = CapacityPlans.findOne(doc.planId);
    if(plan){
      for (let i = 0; i < plan.sprintCount; i++) {
        CapacityPlanOptionSprints.insert({
          optionId: doc._id,
          planId: plan._id,
          sprintId: i,
          start: moment(plan.startDate).add(i * plan.sprintLength, 'ms').startOf('week').add(1, 'days').toDate(),
          end  : moment(plan.startDate).add((i + 1) * plan.sprintLength, 'ms').startOf('week').subtract(2, 'days').toDate()
        });
      }
    }
  });
  CapacityPlanOptions.after.remove((userId, doc) => {
    //console.log('After Option Remove:', doc);
    CapacityPlanOptionSprints.remove({
      optionId: doc._id
    });
  });
}

/**
 * Helpers
 */
CapacityPlanOptions.helpers({
  plan () {
    return CapacityPlans.findOne(this.planId)
  },
  sprints () {
    return CapacityPlanOptionSprints.find({ optionId: this._id }, { sort: { sprintNumber: 1 } })
  }
});