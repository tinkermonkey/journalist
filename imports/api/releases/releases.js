import { Mongo }                   from 'meteor/mongo';
import SimpleSchema                from 'simpl-schema';
import { ChangeTracker }           from 'meteor/austinsand:roba-change-tracker';
import { Util }                    from '../util.js';
import { SchemaHelpers }           from '../schema_helpers.js';
import { IntegrationServers }      from '../integrations/integration_servers';
import { IntegrationServerCaches } from '../integrations/integration_server_caches';
import { Projects }                from '../projects/projects';
import { ReleaseIntegrationLinks } from './release_integration_links';

/**
 * ============================================================================
 * Releases
 * ============================================================================
 */
export const Release = new SimpleSchema({
  title                : {
    type: String
  },
  versionNumber        : {
    type    : String,
    optional: true
  },
  sortVersion          : {
    type    : String,
    optional: true
  },
  externalReleaseTiming: {
    type    : String,
    optional: true
  },
  internalReleaseDate  : {
    type    : Date,
    optional: true
  },
  isReleased           : {
    type        : Boolean,
    defaultValue: false
  },
  // Template for the admin view for a custom form
  adminTemplate        : {
    type    : String,
    optional: true
  },
  // The banner template to show to users
  bannerTemplate       : {
    type    : String,
    optional: true
  },
  // The main page content to show to users
  homeTemplate         : {
    type    : String,
    optional: true
  },
  // Reports to show for this release
  reports              : {
    type    : Array, // String
    optional: true
  },
  'reports.$'          : {
    type: String
  },
  // Generic Meta-data field
  metadata             : {
    type    : Object,
    blackbox: true,
    optional: true
  },
  // Standard tracking fields
  dateCreated          : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy            : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified         : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy           : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const Releases = new Mongo.Collection("releases");
Releases.attachSchema(Release);
ChangeTracker.trackChanges(Releases, 'Releases');

// These are server side only
Releases.deny({
  remove () {
    return true;
  },
  insert () {
    return true;
  },
  update () {
    return true;
  }
});

/**
 * Auto manage the sort ID
 */
if (Meteor.isServer) {
  Releases.before.insert((userId, doc) => {
    //console.log('Before Releases Insert:', doc);
    if (doc.versionNumber) {
      doc.sortVersion = Util.versionNumberToSortString(doc.versionNumber);
    } else {
      doc.sortVersion = Util.versionNumberToSortString(doc.title);
    }
  });
  Releases.before.update((userId, doc, fieldNames, modifier, options) => {
    modifier.$set = modifier.$set || {};
    
    // If either the title or the version are being changed, update the sort version
    if (modifier.$set.versionNumber || modifier.$set.title) {
      // If the version is being nulled our
      if (modifier.$set.versionNumber.length > 0) {
        modifier.$set.sortVersion = Util.versionNumberToSortString(modifier.$set.versionNumber);
      } else if (doc.versionNumber) {
        // If there's already a version, probably just leave the sort version
      } else {
        modifier.$set.sortVersion = Util.versionNumberToSortString(modifier.$set.title || doc.title);
      }
    }
    //console.log('Before Releases Update:', doc, modifier.$set);
  });
}

/**
 * Helpers
 */
Releases.helpers({
  /**
   * Pull in the linked releases for this release
   * @returns {*}
   */
  linkedReleases () {
    let release = this;
    
    return _.flatten(IntegrationServers.find({}).map((server) => {
      let serverVersionList = (IntegrationServerCaches.findOne({ serverId: server._id, key: 'versionList' }) || {}).value || [];
      return _.flatten(ReleaseIntegrationLinks.find({
        serverId : server._id,
        releaseId: release._id
      }).map((releaseLink) => {
        if (releaseLink.integrationReleaseId) {
          if (releaseLink.integrationReleaseId && releaseLink.integrationReleaseId.length) {
            return {
              project : Projects.findOne(releaseLink.projectId),
              releases: releaseLink.integrationReleaseId.map((versionId) => {
                return serverVersionList.find((version) => {
                  return version.id === versionId
                });
              })
            }
          }
        }
      }).filter((projectData) => {
        return projectData.releases && projectData.releases.length
      })).sort((a, b) => {
        if (a.project && a.project.title && b.project && b.project.title) {
          return a.project.title.toLowerCase() > b.project.title.toLowerCase() ? 1 : -1
        }
      })
    }))
  },
  
  /**
   * Get all of the projects that are part of this release
   * @returns {*}
   */
  projects () {
    let release    = this,
        projectIds = _.uniq(ReleaseIntegrationLinks.find({
          releaseId: release._id
        }).map((releaseLink) => {
          return releaseLink.projectId
        }));
    
    return Projects.find({ _id: { $in: projectIds } }, { sort: { title: 1 } })
  },
  
  /**
   * Does this release encompass multiple projects?
   */
  multiProject () {
    return this.projects().count() > 1
  }
});