import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { CapacityPlanOptions } from './capacity_plan_options';
import { CapacityPlanReleases } from './capacity_plan_releases';
import { CapacityPlanSprints } from './capacity_plan_sprints';
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
  CapacityPlans.after.insert((userId, doc) => {
    //console.log('After Option Insert:', doc);
    let plan = CapacityPlans.findOne(doc._id);
    if (plan) {
      for (let i = 0; i < plan.sprintCount; i++) {
        CapacityPlanSprints.insert({
          planId      : plan._id,
          sprintNumber: i,
          start       : moment(plan.startDate).add(i * plan.sprintLength, 'ms').startOf('week').add(1, 'days').toDate(),
          end         : moment(plan.startDate).add((i + 1) * plan.sprintLength, 'ms').startOf('week').subtract(2, 'days').toDate()
        });
      }
    }
  });
  CapacityPlans.after.update((userId, doc, rawChangedFields) => {
    let sprintFieldsChanged = _.intersection(rawChangedFields, [ 'startDate', 'sprintLength', 'sprintCount' ]);
    //console.log('After Plan Update grooming sprints:', sprintFieldsChanged);
    if (sprintFieldsChanged.length) {
      let plan = CapacityPlans.findOne(doc._id);
      if (plan) {
        plan.groomSprints();
      }
    }
  });
  CapacityPlans.after.remove((userId, doc) => {
    //console.log('After Option Remove:', doc);
    CapacityPlanSprints.remove({
      planId: doc._id
    });
  });
  
}

/**
 * Helpers
 */
CapacityPlans.helpers({
  options () {
    return CapacityPlanOptions.find({ planId: this._id }, { sort: { title: 1 } })
  },
  releases () {
    return CapacityPlanReleases.find({ planId: this._id }, { sort: { title: 1 } })
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
    
    CapacityPlanSprints.remove({
      planId      : plan._id,
      sprintNumber: { $gte: plan.sprintCount }
    });
    
    for (let i = 0; i < plan.sprintCount; i++) {
      CapacityPlanSprints.upsert({
        planId      : plan._id,
        sprintNumber: i,
      }, {
        $set: {
          planId      : plan._id,
          sprintNumber: i,
          start       : moment(plan.startDate).add(i * plan.sprintLength, 'ms').startOf('week').add(1, 'days').toDate(),
          end         : moment(plan.startDate).add((i + 1) * plan.sprintLength, 'ms').startOf('week').subtract(2, 'days').toDate()
        }
      });
    }
  }
});