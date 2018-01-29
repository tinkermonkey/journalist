import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { CapacityPlans } from '../capacity_plans';
import { CapacityPlanOptions } from '../capacity_plan_options';
import { CapacityPlanReleases } from '../capacity_plan_releases';
import { CapacityPlanSprintBlocks } from '../capacity_plan_sprint_blocks';
import { CapacityPlanBlockTypes } from '../capacity_plan_block_types';
import { CapacityPlanStrategicEfforts } from '../capacity_plan_strategic_efforts';
import { CapacityPlanStrategicEffortItems } from '../capacity_plan_strategic_effort_items';
import { Auth } from '../../auth';

Meteor.methods({
  /**
   * Add a capacity plan
   * @param title
   */
  addCapacityPlan (title) {
    console.log('addCapacityPlan:', title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      let planId = CapacityPlans.insert({
        title: title
      });
      
      CapacityPlanOptions.insert({
        planId: planId,
        title : 'Option A'
      })
    } else {
      console.error('Non-admin user tried to add a capacity plan:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a capacity plan
   * @param planId
   */
  deleteCapacityPlan (planId) {
    console.log('deleteCapacityPlan:', planId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(planId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Remove all of the linked items
      CapacityPlanOptions.remove({ planId: planId });
      CapacityPlanStrategicEfforts.remove({ planId: planId });
      CapacityPlanStrategicEffortItems.remove({ planId: planId });
      
      CapacityPlans.remove(planId);
    } else {
      console.error('Non-admin user tried to delete a capacity plan:', user.username, planId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a capacity plan record
   * @param planId
   * @param key
   * @param value
   */
  editCapacityPlan (planId, key, value) {
    console.log('editCapacityPlan:', planId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(planId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the capacity plan record to make sure this is authorized
    let capacityPlan = CapacityPlans.findOne(planId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (capacityPlan) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        CapacityPlans.update(planId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit a capacity plan:', user.username, key, planId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add a capacity plan option
   * @param planId
   * @param title
   */
  addCapacityPlanOption (planId, title) {
    console.log('addCapacityPlanOption:', planId, title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(planId, String);
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      let optionId = CapacityPlanOptions.insert({
        planId: planId,
        title : title
      });
      
      // Add blocks for all of the releases
      let plan = CapacityPlans.findOne(planId);
      plan.releases().forEach((release, i) => {
        CapacityPlanSprintBlocks.insert({
          planId      : release.planId,
          optionId    : optionId,
          sprintNumber: plan.sprintCount,
          order       : i,
          dataId      : release._id,
          blockType   : CapacityPlanBlockTypes.release,
          chartData   : {}
        });
      });
    } else {
      console.error('Non-admin user tried to add a capacity plan option:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a capacity plan option
   * @param optionId
   */
  deleteCapacityPlanOption (optionId) {
    console.log('deleteCapacityPlanOption:', optionId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(optionId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      CapacityPlanOptions.remove(optionId);
      
      // Remove all blocks for this plan
      CapacityPlanSprintBlocks.remove({ optionId: optionId });
    } else {
      console.error('Non-admin user tried to delete a capacity plan option:', user.username, optionId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a capacity plan option record
   * @param optionId
   * @param key
   * @param value
   */
  editCapacityPlanOption (optionId, key, value) {
    console.log('editCapacityPlanOption:', optionId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(optionId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the capacity plan option record to make sure this is authorized
    let capacityPlanOption = CapacityPlanOptions.findOne(optionId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (capacityPlanOption) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        CapacityPlanOptions.update(optionId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit a capacity plan option:', user.username, key, optionId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add a capacity plan strategic effort
   * @param planId
   * @param title
   * @param color
   */
  addCapacityPlanStrategicEffort (planId, title, color) {
    console.log('addCapacityPlanStrategicEffort:', planId, title, color);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(planId, String);
    check(title, String);
    check(color, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      CapacityPlanStrategicEfforts.insert({
        planId: planId,
        title : title,
        color : color
      });
    } else {
      console.error('Non-admin user tried to add a capacity plan strategic effort:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a capacity plan strategic effort
   * @param effortId
   */
  deleteCapacityPlanStrategicEffort (effortId) {
    console.log('deleteCapacityPlanStrategicEffort:', effortId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(effortId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Remove all of the items mapped to this effort
      CapacityPlanStrategicEffortItems.remove({ effortId: effortId });
      
      // Remove all of the blocks and links associated with this
      CapacityPlanSprintBlocks.remove({ dataId: effortId });
      
      // Remove the effort itself
      CapacityPlanStrategicEfforts.remove(effortId);
    } else {
      console.error('Non-admin user tried to delete a capacity plan strategic effort:', user.username, effortId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a capacity plan strategic effort record
   * @param effortId
   * @param key
   * @param value
   */
  editCapacityPlanStrategicEffort (effortId, key, value) {
    console.log('editCapacityPlanStrategicEffort:', effortId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(effortId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the capacity plan strategic effort record to make sure this is authorized
    let capacityPlanStrategicEffort = CapacityPlanStrategicEfforts.findOne(effortId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (capacityPlanStrategicEffort) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        CapacityPlanStrategicEfforts.update(effortId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit a capacity plan strategic effort:', user.username, key, effortId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add a capacity plan strategic effort item
   * @param planId
   * @param effortId
   * @param title
   */
  addCapacityPlanStrategicEffortItem (planId, effortId, title) {
    console.log('addCapacityPlanStrategicEffortItem:', planId, effortId, title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(planId, String);
    check(effortId, String);
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      CapacityPlanStrategicEffortItems.insert({
        planId  : planId,
        effortId: effortId,
        title   : title
      });
    } else {
      console.error('Non-admin user tried to add a capacity plan strategic effort item:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a capacity plan strategic effort item
   * @param itemId
   */
  deleteCapacityPlanStrategicEffortItem (itemId) {
    console.log('deleteCapacityPlanStrategicEffortItem:', itemId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(itemId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      CapacityPlanStrategicEffortItems.remove(itemId);
    } else {
      console.error('Non-admin user tried to delete a capacity plan strategic effort item:', user.username, itemId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a capacity plan strategic effort item record
   * @param itemId
   * @param key
   * @param value
   */
  editCapacityPlanStrategicEffortItem (itemId, key, value) {
    console.log('editCapacityPlanStrategicEffortItem:', itemId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(itemId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the capacity plan strategic effort item record to make sure this is authorized
    let capacityPlanStrategicEffortItem = CapacityPlanStrategicEffortItems.findOne(itemId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (capacityPlanStrategicEffortItem) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        CapacityPlanStrategicEffortItems.update(itemId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit a capacity plan strategic effort item:', user.username, key, itemId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add a capacity plan release
   * @param planId
   * @param title
   */
  addCapacityPlanRelease (planId, title) {
    console.log('addCapacityPlanRelease:', planId, title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(planId, String);
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      let releaseId = CapacityPlanReleases.insert({
        planId: planId,
        title : title
      });
      
      // Create a block for each option for the chart
      let plan         = CapacityPlans.findOne(planId),
          releaseCount = CapacityPlanReleases.find({ planId: planId }).count();
      plan.options().forEach((option) => {
        CapacityPlanSprintBlocks.insert({
          planId      : option.planId,
          optionId    : option._id,
          sprintNumber: plan.sprintCount,
          order       : releaseCount,
          dataId      : releaseId,
          blockType   : CapacityPlanBlockTypes.release,
          chartData   : {}
        });
      });
    } else {
      console.error('Non-admin user tried to add a capacity plan release:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a capacity plan release
   * @param releaseId
   */
  deleteCapacityPlanRelease (releaseId) {
    console.log('deleteCapacityPlanRelease:', releaseId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(releaseId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Remove all of the blocks for this release
      CapacityPlanSprintBlocks.remove({ dataId: releaseId });
      
      CapacityPlanReleases.remove(releaseId);
    } else {
      console.error('Non-admin user tried to delete a capacity plan release:', user.username, releaseId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a capacity plan release record
   * @param releaseId
   * @param key
   * @param value
   */
  editCapacityPlanRelease (releaseId, key, value) {
    console.log('editCapacityPlanRelease:', releaseId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(releaseId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the capacity plan release record to make sure this is authorized
    let capacityPlanRelease = CapacityPlanReleases.findOne(releaseId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (capacityPlanRelease) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        CapacityPlanReleases.update(releaseId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit a capacity plan release:', user.username, key, releaseId);
      throw new Meteor.Error(403);
    }
  },
  
});
