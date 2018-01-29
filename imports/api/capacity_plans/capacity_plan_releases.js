import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers';

/**
 * ============================================================================
 * CapacityPlanReleases
 * ============================================================================
 */
export const CapacityPlanRelease = new SimpleSchema({
  planId     : {
    type: String
  },
  title: {
    type: String
  },
  releaseDate: {
    type    : Object,
    blackbox: true,
    optional: true
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

export const CapacityPlanReleases = new Mongo.Collection("capacity_plan_releases");
CapacityPlanReleases.attachSchema(CapacityPlanRelease);
ChangeTracker.trackChanges(CapacityPlanReleases, 'CapacityPlanReleases');

// These are server side only
CapacityPlanReleases.deny({
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
CapacityPlanReleases.helpers({

});