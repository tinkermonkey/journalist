import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Efforts } from '../efforts.js';
import { Auth } from '../../auth.js';

Meteor.methods({
  /**
   * Create a new effort
   * @param contributorId
   * @param title
   */
  addEffort(contributorId, title){
    console.log('addEffort:', contributorId, title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(contributorId, String);
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(contributorId) || user.isAdmin()) {
      // Create the effort
      Efforts.insert({
        contributorId: contributorId,
        title: title
      });
    } else {
      console.error('Non-authorized user tried to add an effort:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit an effort record
   * @param effortId
   * @param key
   * @param value
   */
  editEffort(effortId, key, value){
    console.log('editEffort:', effortId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(effortId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Load the effort to authorize the edit
    let effort = Efforts.findOne(effortId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(effort.contributorId) || user.isAdmin()) {
      let update = {};
      update[key] = value;
      
      // Update the effort
      Efforts.update(effortId, {$set: update});
    } else {
      console.error('Non-admin user tried to edit an effort:', user.username, key, value);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Delete an effort record
   * @param effortId
   */
  deleteEffort(effortId){
    console.log('deleteEffort:', effortId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(effortId, String);
    
    // Load the effort to authorize the edit
    let effort = Efforts.findOne(effortId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(effort.contributorId) || user.isAdmin()) {
      // Delete the effort
      Efforts.remove(effortId);
    } else {
      console.error('Non-authorized user tried to delete an effort:', user.username, effortId);
      throw new Meteor.Error(403);
    }
  }
});
