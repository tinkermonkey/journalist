import './release_dashboard_project_card.html';
import './release_dashboard_project_card.css';
import { Template }                from 'meteor/templating';
import { Releases }                from '../../../../imports/api/releases/releases';
import { ReleaseIntegrationLinks } from '../../../../imports/api/releases/release_integration_links';

/**
 * Template Helpers
 */
Template.ReleaseDashboardProjectCard.helpers({
  nextRelease () {
    let project = this,
        nextRelease;
    
    Releases.find({ isReleased: false, 'metadata.internalReleaseDate': { $exists: true } }, { sort: { 'metadata.internalReleaseDate': 1 } })
        .forEach((release) => {
          let link = ReleaseIntegrationLinks.findOne({ releaseId: release._id, projectId: project._id });
          if (link && nextRelease == null) {
            nextRelease = release
          }
        });
    
    return nextRelease
  },
  latestRelease () {
    let project = this,
        latestRelease;
    
    Releases.find({ isReleased: true, releasedDate: { $exists: true } }, { sort: { releasedDate: -1 } }).forEach((release) => {
      let link = ReleaseIntegrationLinks.findOne({ releaseId: release._id, projectId: project._id });
      if (link && latestRelease == null) {
        latestRelease = release
      }
    });
    
    return latestRelease
  },
  futureReleases () {
    let project        = this,
        futureReleases = [],
        nextRelease;
    
    Releases.find({ isReleased: false, 'metadata.internalReleaseDate': { $exists: true } }, { sort: { 'metadata.internalReleaseDate': 1 } })
        .forEach((release) => {
          let link = ReleaseIntegrationLinks.findOne({ releaseId: release._id, projectId: project._id });
          if (link && nextRelease == null) {
            nextRelease = release
          }
        });
    
    if (nextRelease) {
      console.log('futureReleases project:', project);
      console.log('futureReleases nextRelease:', nextRelease);
      Releases.find({ isReleased: false,
            _id: { $ne: nextRelease._id },
            'metadata.internalReleaseDate': { $exists: true }
          }, { sort: { 'metadata.internalReleaseDate': 1 } })
          .forEach((release) => {
            if (ReleaseIntegrationLinks.find({ releaseId: release._id, projectId: project._id }).count()) {
              futureReleases.push(release)
            }
          });
      
      console.log('futureReleases futureReleases:', futureReleases);
    }
    
    return futureReleases
  }
});

/**
 * Template Event Handlers
 */
Template.ReleaseDashboardProjectCard.events({});

/**
 * Template Created
 */
Template.ReleaseDashboardProjectCard.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ReleaseDashboardProjectCard.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ReleaseDashboardProjectCard.onDestroyed(() => {
  
});
