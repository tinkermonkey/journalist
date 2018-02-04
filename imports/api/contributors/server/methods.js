import { Meteor }                        from 'meteor/meteor';
import { check, Match }                  from 'meteor/check';
import { Contributors }                  from '../contributors.js';
import { ContributorTeamRoles }          from '../contributor_team_roles.js';
import { ContributorProjectAssignments } from '../contributor_project_assignments.js';
import { ContributorRoleDefinitions }    from '../contributor_role_definitions.js';
import { Auth }                          from '../../auth.js';

Meteor.methods({
  /**
   * Create a new contributor
   * @param email
   * @param name
   * @param roleId
   */
  addContributor (email, name, roleId) {
    console.log('addContributor:', email, name, roleId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(email, String);
    check(name, String);
    check(roleId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Check for uniqueness
      let check = Contributors.find({ email: email }).count();
      
      if (check === 0) {
        // Create the contributor
        let contributorId = Contributors.insert({
          email : email,
          name  : name,
          roleId: roleId
        });
        
        // Look for users to sync up
        let user = Meteor.users.findOne({ 'emails.address': email });
        if (user) {
          console.log('addContributor linking user:', email);
          Contributors.update(contributorId, { $set: { userId: user._id, usertype: user.usertype } })
        }
      } else {
        console.error('Contributor already exists:', email);
        throw new Meteor.Error(500);
      }
    } else {
      console.error('Non-admin user tried to add a contributor:', user.username);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a contributor record
   * @param contributorId
   * @param key
   * @param value
   */
  editContributor (contributorId, key, value) {
    console.log('editContributor:', contributorId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(contributorId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the contributor record to make sure this is authorized
    let contributor = Contributors.findOne(contributorId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (contributor) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        Contributors.update(contributorId, { $set: update });
        
        // If the usertype was edited, update the user record also
        if (key === 'usertype') {
          let contributor = Contributors.findOne(contributorId);
          if (contributor.userId) {
            Meteor.users.update(contributor.userId, { $set: { usertype: contributor.usertype } })
          }
        }
      } else {
        throw new Meteor.Error(404);
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
  deleteContributor (contributorId) {
    console.log('deleteContributor:', contributorId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(contributorId, String);
    
    // Get the contributor record to make sure this is authorized
    let contributor = Contributors.findOne(contributorId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (contributor) {
        // Delete the contributor
        Contributors.remove(contributorId);
        
        // Remove all team roles
        ContributorTeamRoles.remove({ contributorId: contributorId });
        
        // remove all project assignments
        ContributorProjectAssignments.remove({ contributorId: contributorId });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to delete a contributor:', user.username, contributorId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add a team role for a contributor
   * @param contributorId
   * @param teamId
   * @param roleId
   */
  addContributorTeamRole (contributorId, teamId, roleId) {
    console.log('addContributorTeamRole:', contributorId, teamId, roleId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(contributorId, String);
    check(teamId, String);
    check(roleId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin() || user.managesContributor(contributorId)) {
      // Insert the team role
      ContributorTeamRoles.insert({
        contributorId: contributorId,
        teamId       : teamId,
        roleId       : roleId
      });
    } else {
      console.error('Non-admin user tried to add a contributor:', user.username);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a team role for a contributor
   * @param teamRoleId
   */
  deleteContributorTeamRole (teamRoleId) {
    console.log('deleteContributorTeamRole:', teamRoleId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(teamRoleId, String);
    
    // Get the team role record to make sure this is authorized
    let teamRole = ContributorTeamRoles.findOne(teamRoleId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin() || user.managesContributor(teamRole.contributorId)) {
      if (teamRole) {
        // Delete the contributor team role
        ContributorTeamRoles.remove(teamRoleId);
        
        // Delete any project assignments for this role
        ContributorProjectAssignments.remove({ teamRoleId: teamRoleId });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to delete a contributor team role:', user.username, teamRoleId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a contributor team role record
   * @param teamRoleId
   * @param key
   * @param value
   */
  editContributorTeamRole (teamRoleId, key, value) {
    console.log('editContributorTeamRole:', teamRoleId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(teamRoleId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the team role record to make sure this is authorized
    let teamRole = ContributorTeamRoles.findOne(teamRoleId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin() || user.managesContributor(teamRole.contributorId)) {
      if (teamRole) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        ContributorTeamRoles.update(teamRoleId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit a contributor team role:', user.username, key, value);
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
  addContributorProjectAssignment (contributorId, teamRoleId, projectId, percent) {
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
      let assignmentId = ContributorProjectAssignments.insert({
        contributorId: contributorId,
        teamRoleId   : teamRoleId,
        projectId    : projectId,
        percent      : percent
      });
      
      // Balance the contributor's assignments
      ContributorProjectAssignments.findOne(assignmentId).balanceOtherAssignments();
    } else {
      console.error('Non-admin user tried to add a project assignment:', user.username);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a project assignment for a contributor
   * @param assignmentId
   */
  deleteContributorProjectAssignment (assignmentId) {
    console.log('deleteContributorProjectAssignment:', assignmentId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(assignmentId, String);
    
    // Get the assignment record to make sure this is authorized
    let assignment = ContributorProjectAssignments.findOne(assignmentId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin() || user.managesContributor(assignment.contributorId)) {
      if (assignment) {
        // Delete the contributor
        ContributorProjectAssignments.remove(assignmentId);
      } else {
        throw new Meteor.Error(404);
      }
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
  editContributorProjectAssignment (assignmentId, key, value) {
    console.log('editContributorProjectAssignment:', assignmentId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(assignmentId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the assignment record to make sure this is authorized
    let assignment = ContributorProjectAssignments.findOne(assignmentId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin() || user.managesContributor(assignment.contributorId)) {
      if (assignment) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        ContributorProjectAssignments.update(assignmentId, { $set: update });
        
        // Balance the contributor's assignments
        if (key === 'percent') {
          ContributorProjectAssignments.findOne(assignmentId).balanceOtherAssignments();
        }
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit a project assignment:', user.username, key, value, assignmentId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add a role definition
   * @param title
   */
  addContributorRoleDefinition (title) {
    console.log('addContributorRoleDefinition:', title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Insert the project percent
      ContributorRoleDefinitions.insert({
        title: title
      });
    } else {
      console.error('Non-admin user tried to add a role definition:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a role definition for a contributor
   * @param definitionId
   */
  deleteContributorRoleDefinition (definitionId) {
    console.log('deleteContributorRoleDefinition:', definitionId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(definitionId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Delete the contributor
      ContributorRoleDefinitions.remove(definitionId);
    } else {
      console.error('Non-admin user tried to delete a role definition:', user.username, definitionId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a contributor role definition record
   * @param definitionId
   * @param key
   * @param value
   */
  editContributorRoleDefinition (definitionId, key, value) {
    console.log('editContributorRoleDefinition:', definitionId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(definitionId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the definition record to make sure this is authorized
    let definition = ContributorRoleDefinitions.findOne(definitionId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (definition) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        ContributorRoleDefinitions.update(definitionId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit a role definition:', user.username, key, value, definitionId);
      throw new Meteor.Error(403);
    }
  }
});