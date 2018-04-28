import { Meteor }                   from 'meteor/meteor';
import { check, Match }             from 'meteor/check';
import { Auth }                     from '../../auth';
import { DynamicCollections }       from '../dynamic_collections';
import { DynamicCollectionManager } from '../../dynamic_collection_manager';

Meteor.methods({
  /**
   * Add a dynamic collection
   * @param title
   */
  addDynamicCollection (title) {
    console.log('addDynamicCollection:', title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Insert the project percent
      DynamicCollections.insert({
        title: title
      });
    } else {
      console.error('Non-admin user tried to add a dynamic collection:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a dynamic collection for a project
   * @param collectionId
   */
  deleteDynamicCollection (collectionId) {
    console.log('deleteDynamicCollection:', collectionId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(collectionId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      DynamicCollections.remove(collectionId);
    } else {
      console.error('Non-admin user tried to delete a dynamic collection:', user.username, collectionId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a dynamic collection record
   * @param collectionId
   * @param key
   * @param value
   */
  editDynamicCollection (collectionId, key, value) {
    console.log('editDynamicCollection:', collectionId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(collectionId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the collection record to make sure this is authorized
    let collection = DynamicCollections.findOne(collectionId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (collection) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        DynamicCollections.update(collectionId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin user tried to edit a dynamic collection:', user.username, key, value, collectionId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Recompile a dynamic collection
   */
  recompileDynamicCollection (collectionId) {
    console.log('recompileDynamicCollection:', collectionId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(collectionId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Get the collection record to make sure this is authorized
      let collection = DynamicCollections.findOne(collectionId);
      
      DynamicCollectionManager.compileCollection(collection);
      
      return 'Collection compiled'
    } else {
      console.error('Non-admin user tried to compile a dynamic collection:', user.username, collectionId);
      throw new Meteor.Error(403);
    }
  }
});
