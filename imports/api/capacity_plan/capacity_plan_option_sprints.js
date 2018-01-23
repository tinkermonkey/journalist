import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

/**
 * ============================================================================
 * CapacityPlanOptionSprints
 * ============================================================================
 */
export const CapacityPlanOptionSprint = new SimpleSchema({
  planId  : {
    type: String
  },
  optionId: {
    type: String
  },
  sprintId: {
    type: String
  },
  start   : {
    type: Date
  },
  end     : {
    type: Date
  }
});

export const CapacityPlanOptionSprints = new Mongo.Collection("capacity_plan_option_sprints");
CapacityPlanOptionSprints.attachSchema(CapacityPlanOptionSprint);

// These are server side only
CapacityPlanOptionSprints.deny({
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

/**
 * Helpers
 */
CapacityPlanOptionSprints.helpers({});