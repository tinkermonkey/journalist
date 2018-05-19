import { Meteor }       from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Backlogs }     from '../backlogs';
import { BacklogItems } from '../backlog_items';
import { Auth }         from '../../auth';

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
    if (user.isManager()) {
      if (backlog) {
        let update    = {};
        update[ key ] = value;
        
        // Update the record
        Backlogs.update(backlogId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-manager tried to edit a backlog:', user.username, key, backlogId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add a backlog Item
   * @param backlogId
   * @param title
   */
  addBacklogItem (backlogId, title) {
    console.log('addBacklogItem:', backlogId, title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(backlogId, String);
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isManager()) {
      BacklogItems.insert({
        backlogId: backlogId,
        title : title
      });
    } else {
      console.error('Non-manager tried to add a backlog item:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a backlog Item
   * @param optionId
   */
  deleteBacklogItem (optionId) {
    console.log('deleteBacklogItem:', optionId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(optionId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      BacklogItems.remove(optionId);
    } else {
      console.error('Non-manager tried to delete a backlog item:', user.username, optionId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a backlog Item record
   * @param optionId
   * @param key
   * @param value
   */
  editBacklogItem (optionId, key, value) {
    console.log('editBacklogItem:', optionId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(optionId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the backlog Item record to make sure this is authorized
    let backlogItem = BacklogItems.findOne(optionId);
    
    // Validate that the current user is an administrator
    if (user.isManager()) {
      if (backlogItem) {
        let update    = {};
        update[ key ] = value;
        
        // update the record
        BacklogItems.update(optionId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-manager tried to edit a backlog item:', user.username, key, optionId);
      throw new Meteor.Error(403);
    }
  },
  
});
