import { Meteor }       from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Tasks }        from '../tasks.js';
import { Auth }         from '../../auth.js';

Meteor.methods({
  /**
   * Create a new task
   * @param contributorId
   * @param title
   */
  addTask (contributorId, title) {
    console.log('addTask:', contributorId, title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(contributorId, String);
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(contributorId) || user.isAdmin()) {
      // Create the task
      Tasks.insert({
        contributorId: contributorId,
        title        : title
      });
    } else {
      console.error('Non-authorized user tried to add an task:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit an task record
   * @param taskId
   * @param key
   * @param value
   */
  editTask (taskId, key, value) {
    console.log('editTask:', taskId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(taskId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Load the task to authorize the edit
    let task = Tasks.findOne(taskId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(task.contributorId) || user.isAdmin()) {
      let update    = {};
      update[ key ] = value;
      
      // Update the task
      Tasks.update(taskId, { $set: update });
    } else {
      console.error('Non-admin user tried to edit an task:', user.username, key, value);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Delete an task record
   * @param taskId
   */
  deleteTask (taskId) {
    console.log('deleteTask:', taskId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(taskId, String);
    
    // Load the task to authorize the edit
    let task = Tasks.findOne(taskId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(task.contributorId) || user.isAdmin()) {
      // Delete the task
      Tasks.remove(taskId);
    } else {
      console.error('Non-authorized user tried to delete an task:', user.username, taskId);
      throw new Meteor.Error(403);
    }
  }
});
