import { Meteor }               from 'meteor/meteor';
import { check, Match }         from 'meteor/check';
import { Releases }             from '../releases';
import { Auth }                 from '../../auth';
import { CapacityPlanReleases } from '../../capacity_plans/capacity_plan_releases';

Meteor.methods({
  /**
   * Add a capacity plan release
   * @param title
   */
  addRelease (title) {
    console.log('addRelease:', title);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isManager()) {
      let releaseId = Releases.insert({
        title: title
      });
    } else {
      console.error('Non-manager tried to add a release:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove a capacity plan release
   * @param releaseId
   */
  deleteRelease (releaseId) {
    console.log('deleteRelease:', releaseId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(releaseId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Delete everything linked to this release
      CapacityPlanReleases.find({ releaseId: releaseId }).forEach((planRelease) => {
        // Remove all of the blocks for this release
        CapacityPlanSprintBlocks.remove({ dataId: planRelease._id });
      });
      
      Releases.remove(releaseId);
    } else {
      console.error('Non-manager tried to delete a release:', user.username, releaseId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a capacity plan release record
   * @param releaseId
   * @param key
   * @param value
   */
  editRelease (releaseId, key, value) {
    console.log('editRelease:', releaseId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(releaseId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the capacity plan release record to make sure this is authorized
    let release = Releases.findOne(releaseId);
    
    // Validate that the current user is an administrator
    if (user.isManager()) {
      if (release) {
        let update    = {};
        update[ key ] = value;
        
        // update the record
        Releases.update(releaseId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-manager tried to edit a release:', user.username, key, releaseId);
      throw new Meteor.Error(403);
    }
  },
  
});
