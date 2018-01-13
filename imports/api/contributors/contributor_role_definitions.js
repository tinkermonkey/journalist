import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * ContributorRoleDefinitions
 * ============================================================================
 */
export const ContributorRoleDefinition = new SimpleSchema({
  title        : {
    type: String
  },
  order        : {
    type        : Number,
    defaultValue: 0
  },
  isManager: {
    type        : Boolean,
    defaultValue: false
  },
  planCapacity: {
    type        : Boolean,
    defaultValue: true
  },
  countCapacityAs: {
    type: String,
    optional: true
  },
  // Standard tracking fields
  dateCreated  : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy    : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy,
    optional : true
  },
  dateModified : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy   : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy,
    optional : true
  }
});

export const ContributorRoleDefinitions = new Mongo.Collection('contributor_role_definitions');
ContributorRoleDefinitions.attachSchema(ContributorRoleDefinition);
ChangeTracker.trackChanges(ContributorRoleDefinitions, 'ContributorRoleDefinitions');

// These are server side only
ContributorRoleDefinitions.deny({
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
ContributorRoleDefinitions.helpers({
  /**
   * Return the role definition id that this should be counted as capacity for
   */
  capacityRole(){
    let roleDef = this;

    if(roleDef.countCapacityAs){
      return ContributorRoleDefinitions.findOne(roleDef.countCapacityAs)
    } else {
      return roleDef
    }
  },

  /**
   * Should this role be counted towards capacity
   */
  countForCapacity(){
    let roleDef = this;

    return roleDef.capacityRole().planCapacity === true
  }
});