import { Meteor }                           from 'meteor/meteor';
import { check, Match }                     from 'meteor/check';
import { CapacityPlans }                    from '../capacity_plans';
import { CapacityPlanOptions }              from '../capacity_plan_options';
import { CapacityPlanReleases }             from '../capacity_plan_releases';
import { CapacityPlanSprintBlocks }         from '../capacity_plan_sprint_blocks';
import { CapacityPlanBlockTypes }           from '../capacity_plan_block_types';
import { CapacityPlanStrategicEfforts }     from '../capacity_plan_strategic_efforts';
import { CapacityPlanStrategicEffortItems } from '../capacity_plan_strategic_effort_items';
import { Auth }                             from '../../auth';

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
    if (user.isManager()) {
      if (capacityPlan) {
        let update    = {};
        update[ key ] = value;
        
        // Update the record
        CapacityPlans.update(planId, { $set: update });
        
        // If the start date was edited, update the sprints
        if (key === 'startDate') {
          capacityPlan.options().forEach((option) => {
            option.groomSprints();
          })
        }
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-manager tried to edit a capacity plan:', user.username, key, planId);
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
    if (user.isManager()) {
      CapacityPlanOptions.insert({
        planId: planId,
        title : title
      });
    } else {
      console.error('Non-manager tried to add a capacity plan option:', user.username, title);
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
      console.error('Non-manager tried to delete a capacity plan option:', user.username, optionId);
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
    if (user.isManager()) {
      if (capacityPlanOption) {
        let update    = {};
        update[ key ] = value;
        
        // update the record
        CapacityPlanOptions.update(optionId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-manager tried to edit a capacity plan option:', user.username, key, optionId);
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
    if (user.isManager()) {
      CapacityPlanStrategicEfforts.insert({
        planId: planId,
        title : title,
        color : color
      });
    } else {
      console.error('Non-manager tried to add a capacity plan strategic effort:', user.username, title);
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
    if (user.isManager()) {
      // Remove all of the items mapped to this effort
      CapacityPlanStrategicEffortItems.remove({ effortId: effortId });
      
      // Remove all of the blocks and links associated with this
      CapacityPlanSprintBlocks.remove({ dataId: effortId });
      
      // Remove the effort itself
      CapacityPlanStrategicEfforts.remove(effortId);
    } else {
      console.error('Non-manager tried to delete a capacity plan strategic effort:', user.username, effortId);
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
    if (user.isManager()) {
      if (capacityPlanStrategicEffort) {
        let update    = {};
        update[ key ] = value;
        
        // update the record
        CapacityPlanStrategicEfforts.update(effortId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-manager tried to edit a capacity plan strategic effort:', user.username, key, effortId);
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
    if (user.isManager()) {
      CapacityPlanStrategicEffortItems.insert({
        planId  : planId,
        effortId: effortId,
        title   : title
      });
    } else {
      console.error('Non-manager tried to add a capacity plan strategic effort item:', user.username, title);
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
    if (user.isManager()) {
      CapacityPlanStrategicEffortItems.remove(itemId);
    } else {
      console.error('Non-manager tried to delete a capacity plan strategic effort item:', user.username, itemId);
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
    if (user.isManager()) {
      if (capacityPlanStrategicEffortItem) {
        let update    = {};
        update[ key ] = value;
        
        // update the record
        CapacityPlanStrategicEffortItems.update(itemId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-manager tried to edit a capacity plan strategic effort item:', user.username, key, itemId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Create a link between a release and a capacity plan option so that the release appears in the plan option
   * @param optionId
   * @param releaseId
   */
  linkReleaseToOption (optionId, releaseId) {
    console.log('linkReleaseToOption:', optionId, releaseId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(optionId, String);
    check(releaseId, String);
    
    // Validate that the current user is an administrator
    if (user.isManager()) {
      // check to see if a link already exists
      if (!CapacityPlanReleases.find({ optionId: optionId, releaseId: releaseId }).count()) {
        let option = CapacityPlanOptions.findOne(optionId);
        if (optionId) {
          // Insert the record
          let planReleaseId = CapacityPlanReleases.insert({ optionId: optionId, releaseId: releaseId }),
              blockCheck    = CapacityPlanSprintBlocks.find({
                planId   : option.planId,
                optionId : optionId,
                dataId   : planReleaseId,
                blockType: CapacityPlanBlockTypes.release
              }).count();
          
          if (!blockCheck) {
            // Insert a block for this release
            CapacityPlanSprintBlocks.insert({
              planId      : option.planId,
              optionId    : optionId,
              sprintNumber: option.sprintCount,
              dataId      : planReleaseId,
              blockType   : CapacityPlanBlockTypes.release,
              order       : 0,
              chartData   : {}
            });
          } else {
            console.log('linkReleaseToOption sprint block already exists:', optionId, releaseId, blockCheck)
          }
        } else {
          throw new Meteor.Error(404);
        }
      } else {
        throw new Meteor.Error(500);
      }
    } else {
      console.error('Non-manager tried to add a capacity plan option release link:', user.username, optionId, releaseId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Create a link between a release and a capacity plan option so that the release appears in the plan option
   * @param optionId
   * @param releaseId
   */
  unlinkReleaseFromPlan (optionId, releaseId) {
    console.log('linkReleaseToPlan:', optionId, releaseId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(optionId, String);
    check(releaseId, String);
    
    // Validate that the current user is an administrator
    if (user.isManager()) {
      let planRelease = CapacityPlanReleases.findOne({ optionId: optionId, releaseId: releaseId });
      
      // check to see if a link already exists
      if (planRelease) {
        CapacityPlanSprintBlocks.remove({ dataId: planRelease._id });
        
        CapacityPlanReleases.remove(planRelease._id);
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-manager tried to add a capacity plan release link:', user.username, optionId, releaseId);
      throw new Meteor.Error(403);
    }
  }
});
