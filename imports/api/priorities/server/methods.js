import { Meteor }       from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Priorities }   from '../priorities.js';
import { Auth }         from '../../auth.js';

Meteor.methods({
  /**
   * Create a new priority
   * @param contributorId
   * @param title
   */
  addPriority (contributorId, title) {
    console.log('addPriority:', contributorId, title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(contributorId, String);
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(contributorId) || user.isAdmin()) {
      let nextOrder = Priorities.find({ contributorId: contributorId }).count() + 1;
      
      // Create the priority
      Priorities.insert({
        contributorId: contributorId,
        title        : title,
        order        : nextOrder
      });
    } else {
      console.error('Non-authorized user tried to add a priority:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a priority record
   * @param priorityId
   * @param key
   * @param value
   */
  editPriority (priorityId, key, value) {
    console.log('editPriority:', priorityId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(priorityId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Load the priority to authorize the edit
    let priority = Priorities.findOne(priorityId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(priority.contributorId) || user.isAdmin()) {
      let update    = {};
      update[ key ] = value;
      
      // Update the priority
      Priorities.update(priorityId, { $set: update });
    } else {
      console.error('Non-admin user tried to edit a priority:', user.username, key, value);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Delete a priority record
   * @param priorityId
   */
  deletePriority (priorityId) {
    console.log('deletePriority:', priorityId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(priorityId, String);
    
    // Load the priority to authorize the edit
    let priority = Priorities.findOne(priorityId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(priority.contributorId) || user.isAdmin()) {
      // Delete the priority
      Priorities.remove(priorityId);
    } else {
      console.error('Non-authorized user tried to delete a priority:', user.username, priorityId);
      throw new Meteor.Error(403);
    }
  }
});
