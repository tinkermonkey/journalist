import { Meteor }       from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { logger }       from 'meteor/austinsand:journalist-logger';
import { Projects }     from '../projects.js';
import { Auth }         from '../../auth.js';

Meteor.methods({
  /**
   * Create a new project
   * @param title
   */
  addProject (title) {
    logger.info('addProject:', title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Create the project
      Projects.insert({
        title: title
      });
    } else {
      logger.error('Non-admin user tried to add a project:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a project record
   * @param projectId
   * @param key
   * @param value
   */
  editProject (projectId, key, value) {
    logger.info('editProject:', projectId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(projectId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      let update    = {};
      update[ key ] = value;
      
      // Update the project
      Projects.update(projectId, { $set: update });
    } else {
      logger.error('Non-admin user tried to edit a project:', user.username, key, value);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Delete a project record
   * @param projectId
   */
  deleteProject (projectId) {
    logger.info('deleteProject:', projectId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(projectId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Delete the project
      Projects.remove(projectId);
    } else {
      logger.error('Non-admin user tried to delete a project:', user.username, projectId);
      throw new Meteor.Error(403);
    }
  }
});
