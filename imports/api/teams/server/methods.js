import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Teams } from '../teams.js';
import { Auth } from '../../auth.js';

Meteor.methods({
  /**
   * Create a new team
   * @param title
   */
  addTeam(title){
    console.log('addTeam:', title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Create the team
      Teams.insert({
        title: title
      });
    } else {
      console.error('Non-admin user tried to add a team:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a team record
   * @param teamId
   * @param key
   * @param value
   */
  editTeam(teamId, key, value){
    console.log('editTeam:', teamId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(teamId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      let update = {};
      update[key] = value;
      
      // Update the team
      Teams.update(teamId, {$set: update});
    } else {
      console.error('Non-admin user tried to edit a team:', user.username, key, value);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Delete a team record
   * @param teamId
   */
  deleteTeam(teamId){
    console.log('deleteTeam:', teamId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(teamId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Delete the team
      Teams.remove(teamId);
    } else {
      console.error('Non-admin user tried to delete a team:', user.username, teamId);
      throw new Meteor.Error(403);
    }
  }
});
