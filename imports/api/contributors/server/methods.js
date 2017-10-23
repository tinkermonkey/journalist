import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Contributors } from '../contributors.js';
import { ContributorTeamRoles } from '../contributor_team_roles.js';
import { Auth } from '../../auth.js';

Meteor.methods({
  /**
   * Create a new contributor
   * @param identifier
   * @param email
   * @param name
   */
  addContributor(identifier, email, name){
    console.log('addContributor:', identifier, email, name);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(identifier, String);
    check(email, String);
    check(name, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Check for uniqueness
      let check = Contributors.find({ identifier: identifier }).count();
      
      if (check === 0) {
        // Create the contributor
        let contributorId = Contributors.insert({
          identifier: identifier,
          email     : email,
          name      : name
        });
        
        // Look for users to sync up
        let user = Meteor.users.findOne({ 'emails.address': email });
        if (user) {
          console.log('addContributor linking user:', email);
          Contributors.update(contributorId, { $set: { userId: user._id, usertype: user.usertype } })
        }
      } else {
        console.error('Contributor already exists:', identifier);
        throw new Meteor.Error(500);
      }
    } else {
      console.error('Non-admin user tried to add a contributor:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a contributor record
   * @param contributorId
   * @param key
   * @param value
   */
  editContributor(contributorId, key, value){
    console.log('editContributor:', contributorId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(contributorId, String);
    check(key, String);
    check(value, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      let update    = {};
      update[ key ] = value;
      
      // Update the contributor
      Contributors.update(contributorId, { $set: update });
      
      // If the usertype was edited, update the user record also
      if(key === 'usertype'){
        let contributor = Contributors.findOne(contributorId);
        if(contributor.userId){
          Meteor.users.update(contributor.userId, {$set: {usertype: contributor.usertype}})
        }
      }
    } else {
      console.error('Non-admin user tried to edit a contributor:', user.username, key, value);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Delete a contributor record
   * @param contributorId
   */
  deleteContributor(contributorId){
    console.log('deleteContributor:', contributorId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(contributorId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Delete the contributor
      Contributors.remove(contributorId);
    } else {
      console.error('Non-admin user tried to delete a contributor:', user.username, contributorId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add a role for a contributor
   * @param contributorId
   * @param teamId
   * @param role
   */
  addContributorTeamRole(contributorId, teamId, role){
    console.log('addContributorRole:', contributorId, teamId, role);
    let user = Auth.requireAuthentication();
  
    // Validate the data is complete
    check(contributorId, String);
    check(teamId, String);
    check(role, Number);
  
    // Validate that the current user is an administrator
    if (user.isAdmin() || user.managesContributor(contributorId)) {
      // Insert the team role
      ContributorTeamRoles.insert({
        contributorId: contributorId,
        teamId: teamId,
        role: role
      });
    } else {
      console.error('Non-admin user tried to edit a contributor:', user.username, key, value);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a team role for a contributor
   * @param roleId
   */
  deleteContributorTeamRole(roleId){
    console.log('deleteContributor:', roleId);
    let user = Auth.requireAuthentication();
  
    // Validate the data is complete
    check(roleId, String);
  
    // Get the role record to make sure this is authorized
    let role = ContributorTeamRoles.findOne(roleId);
    
    // Validate that the current user is an administrator
    if (role && (user.isAdmin() || user.managesContributor(role.contributorId))) {
      // Delete the contributor
      ContributorTeamRoles.remove(roleId);
    } else {
      console.error('Non-admin user tried to delete a contributor:', user.username, roleId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a contributor team role record
   * @param roleId
   * @param key
   * @param value
   */
  editContributorTeamRole(roleId, key, value){
    console.log('editContributorRole:', roleId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(roleId, String);
    check(key, String);
    check(value, Match.Any);
  
    // Get the role record to make sure this is authorized
    let role = ContributorTeamRoles.findOne(roleId);
    
    // Validate that the current user is an administrator
    if (role && (user.isAdmin() || user.managesContributor(role.contributorId))) {
      let update    = {};
      update[ key ] = value;
      
      // Update the contributor
      ContributorTeamRoles.update(roleId, { $set: update });
    } else {
      console.error('Non-admin user tried to edit a contributor:', user.username, key, value);
      throw new Meteor.Error(403);
    }
  }
});