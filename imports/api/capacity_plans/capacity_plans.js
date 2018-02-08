import { Mongo }                        from 'meteor/mongo';
import SimpleSchema                     from 'simpl-schema';
import { SchemaHelpers }                from '../schema_helpers.js';
import { CapacityPlanOptions }          from './capacity_plan_options';
import { CapacityPlanReleases }         from './capacity_plan_releases';
import { CapacityPlanStrategicEfforts } from './capacity_plan_strategic_efforts';
import { ContributorRoleDefinitions }   from '../contributors/contributor_role_definitions';
import { Teams }                        from '../teams/teams';

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
    type    : Array, // String
    optional: true
  },
  'teamIds.$': {
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

export const CapacityPlans = new Mongo.Collection('capacity_plans');
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

/**
 * Helpers
 */
CapacityPlans.helpers({
  /**
   * Get all of the options for this plan
   */
  options () {
    return CapacityPlanOptions.find({ planId: this._id }, { sort: { title: 1 } })
  },
  
  /**
   * Get a specific child option
   */
  option (optionId) {
    return CapacityPlanOptions.findOne({ planId: this._id, _id: optionId })
  },
  
  /**
   * Get all of the releases for this plan
   */
  releases () {
    return CapacityPlanReleases.find({ planId: this._id }, { sort: { title: 1 } })
  },
  
  /**
   * Get all of the efforts in this plan
   */
  efforts () {
    return CapacityPlanStrategicEfforts.find({ planId: this._id }, { sort: { title: 1 } })
  },
  
  /**
   * Get the list of teams in this plan
   * @return {Array}
   */
  teams () {
    if (this.teamIds) {
      return Teams.find({ _id: { $in: this.teamIds } }, { sort: { title: 1 } })
    } else {
      return []
    }
  },
  
  /**
   * Get the list of reportable roles for this plan
   */
  roles () {
    let plan    = this,
        roleIds = _.uniq(_.flatten(plan.teams().map((team) => {
          return team.capacityPlanRoles()
        })));
    
    return ContributorRoleDefinitions.find({ _id: { $in: roleIds } }, { sort: { title: 1 } }).fetch()
  },
  
  /**
   * Get the list of teamIds
   */
  teamIdsSorted () {
    return this.teams().map((team) => {
      return team._id
    })
  }
});