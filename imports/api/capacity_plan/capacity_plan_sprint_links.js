import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Auth } from '../auth';
import { CapacityPlanSprintBlocks } from './capacity_plan_sprint_blocks';

/**
 * ============================================================================
 * CapacityPlanSprintLinks
 * ============================================================================
 */
export const CapacityPlanSprintLink = new SimpleSchema({
  planId      : {
    type: String
  },
  optionId    : {
    type: String
  },
  sourceId    : {
    type: String
  },
  targetId    : {
    type: String
  },
  sourceSprint: {
    type    : Number,
    optional: true
  },
  targetSprint: {
    type: Number
  }
});

export const CapacityPlanSprintLinks = new Mongo.Collection("capacity_plan_sprint_links");
CapacityPlanSprintLinks.attachSchema(CapacityPlanSprintLink);
ChangeTracker.trackChanges(CapacityPlanSprintLinks, 'CapacityPlanSprintLinks');

// Server side only for now
CapacityPlanSprintLinks.deny({
  remove: Auth.denyIfNotAdmin,
  insert: Auth.denyIfNotAdmin,
  update: Auth.denyIfNotAdmin
});

/**
 * Helpers
 */
CapacityPlanSprintLinks.helpers({
  source () {
    return CapacityPlanSprintBlocks.findOne(this.sourceId)
  }
});