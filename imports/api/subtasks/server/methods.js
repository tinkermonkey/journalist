import { Meteor }       from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Auth }         from '../../auth';
import { Subtasks }     from '../subtasks';

Meteor.methods({
  /**
   * Create a new subtask
   * @param contributorId {String}
   * @param sourceCollection {String}
   * @param sourceId {String}
   * @param title {String}
   * @param order {Number} Optional
   */
  addSubtask (contributorId, sourceCollection, sourceId, title, order) {
    console.log('addSubtask:', contributorId, sourceCollection, sourceId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(contributorId, String);
    check(sourceCollection, String);
    check(sourceId, String);
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(contributorId) || user.isAdmin() || user.contributorId() === contributorId) {
      if (!_.isNumber(order)) {
        // Put this at the end of the list
        let lastItem = Subtasks.findOne({
          sourceCollection: sourceCollection,
          sourceId        : sourceId
        }, { sort: { order: -1 } });
        order        = lastItem ? lastItem.order + 1 : 0
      }
      
      // Create the subtask
      let subtaskId = Subtasks.insert({
        contributorId   : contributorId,
        sourceCollection: sourceCollection,
        sourceId        : sourceId,
        title           : title,
        order           : order
      });
      return { subtaskId: subtaskId }
    } else {
      console.error('Non-authorized user tried to add a subtask:', user.contributorId(), contributorId, user.username, sourceCollection, sourceId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a subtask record
   * @param subtaskId
   * @param key
   * @param value
   */
  editSubtask (subtaskId, key, value) {
    console.log('editSubtask:', subtaskId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(subtaskId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Load the subtask to authorize the edit
    let subtask = Subtasks.findOne(subtaskId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(subtask.contributorId) || user.isAdmin() || user.contributorId() === subtask.contributorId) {
      let update    = {};
      update[ key ] = value;
      
      // Tie the date completed to the completed flag
      if (key === 'isCompleted' && value === true) {
        update.dateCompleted = new Date();
      }
      
      // Update the subtask
      Subtasks.update(subtaskId, { $set: update });
      
      if (key === 'isCompleted' && value !== true) {
        Subtasks.update(subtaskId, { $unset: { dateCompleted: true } });
      }
    } else {
      console.error('Non-authorized user tried to edit a subtask:', user.username, key, value);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Delete a subtask record
   * @param subtaskId
   */
  deleteSubtask (subtaskId) {
    console.log('deleteSubtask:', subtaskId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(subtaskId, String);
    
    // Load the subtask to authorize the edit
    let subtask = Subtasks.findOne(subtaskId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(subtask.contributorId) || user.isAdmin()) {
      // Delete the subtask
      Subtasks.remove(subtaskId);
    } else {
      console.error('Non-authorized user tried to delete a subtask:', user.username, subtaskId);
      throw new Meteor.Error(403);
    }
  },
  
});
