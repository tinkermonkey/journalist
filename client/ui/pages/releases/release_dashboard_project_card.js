import './release_dashboard_project_card.html';
import './release_dashboard_project_card.css';
import { Template }                from 'meteor/templating';
import { Releases }                from '../../../../imports/api/releases/releases';
import { ReleaseIntegrationLinks } from '../../../../imports/api/releases/release_integration_links';
import '../../components/releases/release_link';
import numeral                     from 'numeral';

/**
 * Template Helpers
 */
Template.ReleaseDashboardProjectCard.helpers({
  /**
   * Calculate the complementary color for the project background color
   * @returns {string}
   */
  complementaryColor () {
    let project = this;
    if (project.backgroundColor) {
      try {
        let hex = project.backgroundColor;
        
        if (hex.indexOf('#') === 0) {
          hex = hex.slice(1);
        }
        
        let r = parseInt(hex.slice(0, 2), 16),
            g = parseInt(hex.slice(2, 4), 16),
            b = parseInt(hex.slice(4, 6), 16);
        
        // invert color components
        r = Math.min((255 - r) * 2, 255).toString(16);
        g = Math.min((255 - g) * 2, 255).toString(16);
        b = Math.min((255 - b) * 2, 255).toString(16);
        
        let padZero = (d) => {
          return d.length < 2 ? '0' + d : d
        };
        
        // pad each with zeros and return
        return '#' + padZero(r) + padZero(g) + padZero(b)
      } catch (e) {
        console.error('Error in complementary color:', e);
      }
    }
    
    return '#ffffff'
  },
  
  /**
   * Determine if the release version number should be shown
   */
  showReleaseVersion () {
    let release = this;
    
    return release.versionNumber && release.title && release.versionNumber !== release.title
  },
  
  /**
   * Get the next release for this project
   * @returns {*}
   */
  nextRelease () {
    let project = this,
        nextRelease;
    
    Releases.find({ isReleased: false, internalReleaseDate: { $exists: true } }, { sort: { internalReleaseDate: 1 } })
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
    
    Releases.find({ isReleased: true, releaseDate: { $exists: true } }, { sort: { releaseDate: -1 } }).forEach((release) => {
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
    
    Releases.find({ isReleased: false, internalReleaseDate: { $exists: true } }, { sort: { internalReleaseDate: 1 } })
        .forEach((release) => {
          let link = ReleaseIntegrationLinks.findOne({ releaseId: release._id, projectId: project._id });
          if (link && nextRelease == null) {
            nextRelease = release
          }
        });
    
    if (nextRelease) {
      //console.log('futureReleases project:', project);
      //console.log('futureReleases nextRelease:', nextRelease);
      Releases.find({
            isReleased         : false,
            _id                : { $ne: nextRelease._id },
            internalReleaseDate: { $exists: true }
          }, { sort: { internalReleaseDate: 1 } })
          .forEach((release) => {
            if (ReleaseIntegrationLinks.find({ releaseId: release._id, projectId: project._id }).count()) {
              futureReleases.push(release)
            }
          });
      
      //console.log('futureReleases futureReleases:', futureReleases);
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
