import { Mongo }                        from 'meteor/mongo';
import SimpleSchema                     from 'simpl-schema';
import { BacklogResourceDurationUnits } from './backlog_resource_duration_units';

/**
 * ============================================================================
 * BacklogItemResourceAllocations
 * ============================================================================
 */
export const BacklogItemResourceAllocation = new SimpleSchema({
  backlogItemId   : {
    type: String
  },
  roleDefinitionId: {
    type: String
  },
  contributorId   : {
    type    : String,
    optional: true
  },
  duration        : {
    type: SimpleSchema.Integer,
  },
  durationUnits   : {
    type        : SimpleSchema.Integer,
    defaultValue: BacklogResourceDurationUnits.weeks
  }
});

export const BacklogItemResourceAllocations = new Mongo.Collection("backlog_item_resource_allocations");
BacklogItemResourceAllocations.attachSchema(BacklogItemResourceAllocation);

BacklogItemResourceAllocations.deny({
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
BacklogItemResourceAllocations.helpers({});