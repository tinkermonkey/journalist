import './admin_project_releases.html';
import { Template }                from 'meteor/templating';
import { IntegrationServers }      from '../../../../../imports/api/integrations/integration_servers';
import { IntegrationServerCaches } from '../../../../../imports/api/integrations/integration_server_caches';
import { ReleaseIntegrationLinks } from '../../../../../imports/api/releases/release_integration_links';
import { Util }                    from '../../../../../imports/api/util';
import '../releases/admin_create_release_wizard';

/**
 * Template Helpers
 */
Template.AdminProjectReleases.helpers({
  integrationServers () {
    let project = this;
    if (project.integrationProjects) {
      return IntegrationServers.find({ _id: { $in: _.keys(project.integrationProjects) } }, { sort: { title: 1 } })
    }
  },
  linkedReleases (project) {
    let server          = this,
        linkedProjectId = project.integrationProjects[ server._id ],
        versionList     = IntegrationServerCaches.findOne({ serverId: server._id, key: 'versionList' }),
        releaseMap      = {},
        links           = _.flatten(ReleaseIntegrationLinks.find({ projectId: project._id, serverId: server._id }).fetch()
            .map((releaseLink) => {
              releaseLink.integrationReleaseId.forEach((linkedId) => {
                releaseMap[ linkedId ] = releaseLink.releaseId;
              });
              return releaseLink.integrationReleaseId
            }));
    
    if (versionList && versionList.value && versionList.value.length) {
      return versionList.value.filter((version) => {
        // Loose comparison
        return version.projectId == linkedProjectId
      }).filter((version) => {
        return _.contains(links, version.id)
      }).map((version) => {
        version.releaseId = releaseMap[ version.id ];
        return version
      }).sort((a, b) => {
        return Util.versionNumberToSortString(a.name) > Util.versionNumberToSortString(b.name) ? -1 : 1
      })
    }
  },
  unlinkedReleases (project) {
    let server          = this,
        linkedProjectId = project.integrationProjects[ server._id ],
        versionList     = IntegrationServerCaches.findOne({ serverId: server._id, key: 'versionList' }),
        links           = _.flatten(ReleaseIntegrationLinks.find({ projectId: project._id, serverId: server._id }).fetch()
            .map((releaseLink) => {
              return releaseLink.integrationReleaseId
            }));
    
    if (versionList && versionList.value && versionList.value.length) {
      return versionList.value.filter((version) => {
        // Loose comparison
        return version.projectId == linkedProjectId
      }).filter((version) => {
        return !_.contains(links, version.id)
      }).map((version) => {
        version.server  = server;
        version.project = project;
        
        return version
      }).sort((a, b) => {
        //console.log(a.name, b.name, Util.versionNumberToSortString(a.name), '>', Util.versionNumberToSortString(b.name), Util.versionNumberToSortString(a.name) > Util.versionNumberToSortString(b.name));
        return Util.versionNumberToSortString(a.name) > Util.versionNumberToSortString(b.name) ? -1 : 1
      })
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdminProjectReleases.events({
  'click .create-release' (e, instance) {
    let context = this;
    
    console.log('Create release:', context);
    
    RobaDialog.show({
      contentTemplate: 'AdminCreateReleaseWizard',
      contentData    : context,
      title          : 'Create Release',
      width          : 500,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Create' }
      ],
      callback       : function (btn) {
        if (btn.match(/create/i)) {
          // Get the wizard context
          let wizardInstance  = Blaze.getView($('.admin-create-release-wizard-container').get(0)).templateInstance(),
              context         = wizardInstance.context.get(),
              data            = wizardInstance.data,
              existingRelease = wizardInstance.existingRelease,
              releaseLinkMap  = {};
          
          console.log(btn, 'AdminCreateReleaseWizard:', context, data, existingRelease);
          
          // Group all of the releases to link by server and project
          context.linkVersions.forEach((linkVersionId) => {
            let version = context.versionList.find((version) => {
                  return version.id.toString() === linkVersionId
                }),
                key     = version.server._id + '_' + version.project._id;
            
            // Check to see if this combo is mapped yet
            console.log('AdminCreateReleaseWizard checking release link map:', version.server._id, version.project._id, key);
            if (releaseLinkMap[ key ]) {
              releaseLinkMap[ key ].releases.push(linkVersionId);
              console.log('AdminCreateReleaseWizard updated release link map:', releaseLinkMap[ key ]);
            } else {
              releaseLinkMap[ key ] = {
                serverId : version.server._id,
                projectId: version.project._id,
                releases : [ linkVersionId ]
              };
              console.log('AdminCreateReleaseWizard created release link map:', releaseLinkMap[ key ]);
            }
          });
          
          console.log('AdminCreateReleaseWizard release link map:', releaseLinkMap);
  
          RobaDialog.hide();
          
          // Check if we need to create a release
          if (existingRelease && existingRelease._id) {
            console.log('AdminCreateReleaseWizard using existing release:', existingRelease._id, existingRelease.title);
            
            // Link in the selected releases
            if (_.keys(releaseLinkMap).length) {
              _.keys(releaseLinkMap).forEach((key) => {
                let releaseLink = releaseLinkMap[ key ];
                console.log('AdminCreateReleaseWizard creating link for releases:', releaseLink);
                Meteor.call('linkIntegrationRelease', existingRelease._id, releaseLink.serverId, releaseLink.projectId, releaseLink.releases, (error, response) => {
                  if (error) {
                    RobaDialog.error('Failed to create release link: ' + error.toString());
                  }
                });
              });
            }
          } else {
            console.log('AdminCreateReleaseWizard creating release:', context.title);
            Meteor.call('addRelease', context.title, context.versionNumber, context.isReleased, (error, releaseId) => {
              if (error) {
                RobaDialog.error('Failed to create release: ' + error.toString());
              } else if (releaseId) {
                // Link in the selected releases
                if (_.keys(releaseLinkMap).length) {
                  _.keys(releaseLinkMap).forEach((key) => {
                    let releaseLink = releaseLinkMap[ key ];
                    console.log('AdminCreateReleaseWizard creating link for releases:', releaseLink);
                    Meteor.call('linkIntegrationRelease', releaseId, releaseLink.serverId, releaseLink.projectId, releaseLink.releases, (error, response) => {
                      if (error) {
                        RobaDialog.error('Failed to create release link: ' + error.toString());
                      }
                    });
                  });
                }
              } else {
                RobaDialog.error('Failed to create release, no error given');
              }
            });
          }
        } else {
          RobaDialog.hide();
        }
      }.bind(this)
    });
    
  },
  'click .link-release' (e, instance) {
    let context = this;
    
    console.log('Link release:', context);
  }
});

/**
 * Template Created
 */
Template.AdminProjectReleases.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('integration_servers');
  instance.subscribe('integration_server_caches', 'versionList');
});

/**
 * Template Rendered
 */
Template.AdminProjectReleases.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminProjectReleases.onDestroyed(() => {
  
});
