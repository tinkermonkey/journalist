import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Contributors } from '../contributors.js';
import { ContributorTeamRoles } from '../contributor_team_roles.js';
import { ContributorProjectAssignments } from '../contributor_project_assignments.js';
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
    console.log('addContributorTeamRole:', contributorId, teamId, role);
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
    console.log('deleteContributorTeamRole:', roleId);
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
    console.log('editContributorTeamRole:', roleId, key);
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
  },
  
  /**
   * Add an assignment for a contributor
   * @param contributorId
   * @param teamRoleId
   * @param projectId
   * @param percent
   */
  addContributorProjectAssignment(contributorId, teamRoleId, projectId, percent){
    console.log('addContributorProjectAssignment:', contributorId, teamRoleId, projectId, percent);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(contributorId, String);
    check(teamRoleId, String);
    check(projectId, String);
    check(percent, Number);
    
    // Validate that the current user is an administrator
    if (user.isAdmin() || user.managesContributor(contributorId)) {
      // Insert the project percent
      ContributorProjectAssignments.insert({
        contributorId: contributorId,
        teamRoleId: teamRoleId,
        projectId: projectId,
        percent: percent
      });
    } else {
      console.error('Non-admin user tried to edit a project assignment:', user.username, key, value);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a project assignment for a contributor
   * @param assignmentId
   */
  deleteContributorProjectAssignment(assignmentId){
    console.log('deleteContributorProjectAssignment:', assignmentId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(assignmentId, String);
    
    // Get the assignment record to make sure this is authorized
    let assignment = ContributorProjectAssignments.findOne(assignmentId);
    
    // Validate that the current user is an administrator
    if (assignment && (user.isAdmin() || user.managesContributor(assignment.contributorId))) {
      // Delete the contributor
      ContributorProjectAssignments.remove(assignmentId);
    } else {
      console.error('Non-admin user tried to delete a project assignment:', user.username, assignmentId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a contributor project assignment record
   * @param assignmentId
   * @param key
   * @param value
   */
  editContributorProjectAssignment(assignmentId, key, value){
    console.log('editContributorProjectAssignment:', assignmentId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(assignmentId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the assignment record to make sure this is authorized
    let assignment = ContributorProjectAssignments.findOne(assignmentId);
    
    // Validate that the current user is an administrator
    if (assignment && (user.isAdmin() || user.managesContributor(assignment.contributorId))) {
      let update    = {};
      update[ key ] = value;
      
      // Update the contributor
      ContributorProjectAssignments.update(assignmentId, { $set: update });
      
      // Balance the contributor's assignments
      ContributorProjectAssignments.findOne(assignmentId).balanceOtherAssignments();
    } else {
      console.error('Non-admin user tried to edit a project assignment:', user.username, key, value, assignmentId);
      throw new Meteor.Error(403);
    }
  }
});