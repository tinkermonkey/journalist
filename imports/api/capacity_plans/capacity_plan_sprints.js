import { Mongo }    from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Auth }     from '../auth';

/**
 * ============================================================================
 * CapacityPlanSprints
 * ============================================================================
 */
export const CapacityPlanSprint = new SimpleSchema({
  planId      : {
    type: String
  },
  optionId    : {
    type: String
  },
  sprintNumber: {
    type: Number
  },
  title       : {
    type    : String,
    optional: true
  },
  startDate   : {
    type: Date
  },
  endDate     : {
    type: Date
  }
});

export const CapacityPlanSprints = new Mongo.Collection('capacity_plan_sprints');
CapacityPlanSprints.attachSchema(CapacityPlanSprint);

// These are server side only
CapacityPlanSprints.deny({
  remove () {
    return true;
  },
  insert () {
    return true;
  },
  update: Auth.denyIfNotManager
});

/**
 * Helpers
 */
CapacityPlanSprints.helpers({
  sprintTitle () {
    return this.title || 'Sprint ' + (this.sprintNumber + 1)
  }
});