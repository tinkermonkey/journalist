import { Meteor }                          from 'meteor/meteor';
import { check, Match }                    from 'meteor/check';
import { Backlogs }                        from '../backlogs';
import { BacklogItems }                    from '../backlog_items';
import { BacklogItemCategories }           from '../backlog_item_categories';
import { BacklogItemResourceAllocations }  from '../backlog_item_resource_allocations';
import { BacklogItemResourceRequirements } from '../backlog_item_resource_requirements';
import { Auth }                            from '../../auth';

Meteor.methods({
  /**
   * Add a backlog
   * @param title
   */
  addBacklog (title) {
    console.log('addBacklog:', title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      let backlogId = Backlogs.insert({
        title: title
      });
    } else {
      console.error('Non-admin user tried to add a backlog:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a backlog
   * @param backlogId
   */
  deleteBacklog (backlogId) {
    console.log('deleteBacklog:', backlogId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(backlogId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Remove all of the links to backlog items
      
      Backlogs.remove(backlogId);
    } else {
      console.error('Non-admin user tried to delete a backlog:', user.username, backlogId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a backlog record
   * @param backlogId
   * @param key
   * @param value
   */
  editBacklog (backlogId, key, value) {
    console.log('editBacklog:', backlogId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(backlogId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the backlog record to make sure this is authorized
    let backlog = Backlogs.findOne(backlogId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (backlog) {
        let update    = {};
        update[ key ] = value;
        
        // Update the record
        Backlogs.update(backlogId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin tried to edit a backlog:', user.username, key, backlogId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add a backlog Item
   * @param title
   * @param backlogId
   */
  addBacklogItem (title, backlogId) {
    console.log('addBacklogItem:', title, backlogId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    if (backlogId) {
      check(backlogId, String);
    }
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      let item = {
        title: title
      };
      
      if (backlogId) {
        let backlog = Backlogs.findOne(backlogId);
        if (backlog) {
          item.backlogIds    = [ backlogId ];
          item.backlogOrders = {};
          
          item.backlogOrders[ backlogId ] = backlog.items().count();
        }
      }
      
      BacklogItems.insert(item);
    } else {
      console.error('Non-admin tried to add a backlog item:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a backlog Item
   * @param itemId
   */
  deleteBacklogItem (itemId) {
    console.log('deleteBacklogItem:', itemId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(itemId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      BacklogItems.remove(itemId);
    } else {
      console.error('Non-admin tried to delete a backlog item:', user.username, itemId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a backlog Item record
   * @param itemId
   * @param key
   * @param value
   */
  editBacklogItem (itemId, key, value) {
    console.log('editBacklogItem:', itemId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(itemId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the backlog Item record to make sure this is authorized
    let backlogItem = BacklogItems.findOne(itemId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (backlogItem) {
        let update    = {};
        update[ key ] = value;
        
        // update the record
        BacklogItems.update(itemId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin tried to edit a backlog item:', user.username, key, itemId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a backlog Item record
   * @param itemId
   * @param backlogId
   * @param order
   */
  editBacklogItemOrder (itemId, backlogId, order) {
    console.log('editBacklogItemOrder:', itemId, backlogId, order);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(itemId, String);
    check(backlogId, String);
    check(order, Number);
    
    // Get the backlog Item record to make sure this is authorized
    let backlogItem = BacklogItems.findOne(itemId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (backlogItem) {
        backlogItem.setBacklogOrder(backlogId, order)
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin tried to edit a backlog item order:', user.username, itemId, backlogId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add a backlog Category
   * @param title
   */
  addBacklogItemCategory (title) {
    console.log('addBacklogItemCategory:', title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Make sure one doesn't already exist
      if (BacklogItemCategories.find({ title: title }).count() === 0) {
        BacklogItemCategories.insert({
          title: title
        });
      } else {
        throw new Meteor.Error(409);
      }
    } else {
      console.error('Non-admin tried to add a backlog category:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a backlog Category
   * @param categoryId
   */
  deleteBacklogItemCategory (categoryId) {
    console.log('deleteBacklogItemCategory:', categoryId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(categoryId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      let category = BacklogItemCategories.findOne(categoryId);
      if (category) {
        // Remove this category from any backlog items
        BacklogItems.update({ categoryId: categoryId }, { $unset: { categoryId: true } }, { multi: true });
        
        BacklogItemCategories.remove(categoryId);
      } else {
        throw new Meteor.Error(404);
      }
      
    } else {
      console.error('Non-admin tried to delete a backlog category:', user.username, categoryId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a backlog Category record
   * @param categoryId
   * @param key
   * @param value
   */
  editBacklogItemCategory (categoryId, key, value) {
    console.log('editBacklogItemCategory:', categoryId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(categoryId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the backlog Category record to make sure this is authorized
    let category = BacklogItemCategories.findOne(categoryId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (category) {
        let update    = {};
        update[ key ] = value;
        
        // update the record
        BacklogItemCategories.update(categoryId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin tried to edit a backlog category:', user.username, key, categoryId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add a backlog item resource requirement
   * @param itemId
   * @param roleDefinitionId
   */
  addBacklogItemResourceRequirement (itemId, roleDefinitionId) {
    console.log('addBacklogItemResourceRequirement:', itemId, roleDefinitionId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(itemId, String);
    check(roleDefinitionId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      BacklogItemResourceRequirements.insert({
        backlogItemId   : itemId,
        roleDefinitionId: roleDefinitionId
      });
    } else {
      console.error('Non-admin tried to add a backlog item resource requirement:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a backlog item resource requirement
   * @param requirementId
   */
  deleteBacklogItemResourceRequirement (requirementId) {
    console.log('deleteBacklogItemResourceRequirement:', requirementId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(requirementId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      let requirement = BacklogItemResourceRequirements.findOne(requirementId);
      
      if (requirement) {
        BacklogItemResourceRequirements.remove(requirementId);
        
        // Delete all of the allocations for this resource
        BacklogItemResourceAllocations.remove({
          backlogItemId   : requirement.backlogItemId,
          roleDefinitionId: requirement.roleDefinitionId
        });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin tried to delete a backlog item resource requirement:', user.username, requirementId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a backlog item resource requirement record
   * @param requirementId
   * @param key
   * @param value
   */
  editBacklogItemResourceRequirement (requirementId, key, value) {
    console.log('editBacklogItemResourceRequirement:', requirementId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(requirementId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the backlog item resource requirement record to make sure this is authorized
    let backlogItemResourceRequirement = BacklogItemResourceRequirements.findOne(requirementId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (backlogItemResourceRequirement) {
        let update    = {};
        update[ key ] = value;
        
        // update the record
        BacklogItemResourceRequirements.update(requirementId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin tried to edit a backlog item resource requirement:', user.username, key, requirementId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add a backlog item resource allocation
   * @param itemId
   * @param roleDefinitionId
   */
  addBacklogItemResourceAllocation (itemId, roleDefinitionId) {
    console.log('addBacklogItemResourceAllocation:', itemId, roleDefinitionId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(itemId, String);
    check(roleDefinitionId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      BacklogItemResourceAllocations.insert({
        backlogItemId   : itemId,
        roleDefinitionId: roleDefinitionId
      });
    } else {
      console.error('Non-admin tried to add a backlog item resource allocation:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a backlog item resource allocation
   * @param allocationId
   */
  deleteBacklogItemResourceAllocation (allocationId) {
    console.log('deleteBacklogItemResourceAllocation:', allocationId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(allocationId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      let allocation = BacklogItemResourceAllocations.findOne(allocationId);
      
      if (allocation) {
        BacklogItemResourceAllocations.remove(allocationId);
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin tried to delete a backlog item resource allocation:', user.username, allocationId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a backlog item resource allocation record
   * @param allocationId
   * @param key
   * @param value
   */
  editBacklogItemResourceAllocation (allocationId, key, value) {
    console.log('editBacklogItemResourceAllocation:', allocationId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(allocationId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the backlog item resource allocation record to make sure this is authorized
    let backlogItemResourceAllocation = BacklogItemResourceAllocations.findOne(allocationId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (backlogItemResourceAllocation) {
        let update    = {};
        update[ key ] = value;
        
        // update the record
        BacklogItemResourceAllocations.update(allocationId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin tried to edit a backlog item resource allocation:', user.username, key, allocationId);
      throw new Meteor.Error(403);
    }
  },
});
