import { Mongo }                        from 'meteor/mongo';
import SimpleSchema                     from 'simpl-schema';
import { BacklogResourceDurationUnits } from './backlog_resource_duration_units';

/**
 * ============================================================================
 * BacklogItemResourceRequirements
 * ============================================================================
 */
export const BacklogItemResourceRequirement = new SimpleSchema({
  backlogItemId: {
    type: String
  },
  roleDefinitionId: {
    type: String
  },
  roleQuantity    : {
    type        : SimpleSchema.Integer,
    defaultValue: 1
  },
  durationQuantity: {
    type        : SimpleSchema.Integer,
    defaultValue: 1
  },
  durationUnits   : {
    type        : SimpleSchema.Integer,
    defaultValue: BacklogResourceDurationUnits.weeks
  }
});

export const BacklogItemResourceRequirements = new Mongo.Collection("backlog_item_resource_requirements");
BacklogItemResourceRequirements.attachSchema(BacklogItemResourceRequirement);

BacklogItemResourceRequirements.deny({
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
BacklogItemResourceRequirements.helpers({});