import { Meteor }                  from 'meteor/meteor';
import { check, Match }            from 'meteor/check';
import { Auth }                    from '../../auth';
import { CapacityPlanReleases }    from '../../capacity_plans/capacity_plan_releases';
import { Releases }                from '../releases';
import { ReleaseIntegrationLinks } from '../release_integration_links';

Meteor.methods({
  /**
   * Add a capacity plan release
   * @param title
   * @param versionNumber (optional)
   * @param isReleased (optional)
   */
  addRelease (title, versionNumber, isReleased) {
    console.log('addRelease:', title, versionNumber, isReleased);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isManager()) {
      return Releases.insert({
        title        : title,
        versionNumber: versionNumber,
        isReleased   : isReleased
      })
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
  
  /**
   * Link an integration release to a release
   * @param releaseId
   * @param serverId
   * @param projectId
   * @param integrationReleaseId (optional)
   */
  linkIntegrationRelease (releaseId, serverId, projectId, integrationReleaseId) {
    console.log('linkIntegrationRelease:', releaseId, serverId, projectId, integrationReleaseId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(releaseId, String);
    check(serverId, String);
    check(projectId, String);
    
    // Validate that the current user is an administrator
    if (user.isManager()) {
      // Create/update the link
      if (integrationReleaseId != null) {
        // update the record
        ReleaseIntegrationLinks.upsert({
          releaseId: releaseId,
          serverId : serverId,
          projectId: projectId
        }, {
          $set: {
            releaseId           : releaseId,
            serverId            : serverId,
            projectId           : projectId,
            integrationReleaseId: integrationReleaseId
          }
        });
      } else {
        // Remove the link
        ReleaseIntegrationLinks.remove({
          releaseId: releaseId,
          serverId : serverId,
          projectId: projectId
        });
      }
    } else {
      console.error('Non-manager tried to edit a release:', user.username, releaseId, serverId, projectId, integrationReleaseId);
      throw new Meteor.Error(403);
    }
  }
});
