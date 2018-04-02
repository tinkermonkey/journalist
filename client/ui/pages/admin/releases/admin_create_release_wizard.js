import './admin_create_release_wizard.html';
import { Template }                from 'meteor/templating';
import { IntegrationServerCaches } from '../../../../../imports/api/integrations/integration_server_caches';
import { IntegrationServers }      from '../../../../../imports/api/integrations/integration_servers';
import { Projects }                from '../../../../../imports/api/projects/projects';
import { Releases }                from '../../../../../imports/api/releases/releases';
import { ReleaseIntegrationLinks } from '../../../../../imports/api/releases/release_integration_links';
import { Util }                    from '../../../../../imports/api/util';

/**
 * Template Helpers
 */
Template.AdminCreateReleaseWizard.helpers({
  context () {
    return Template.instance().context.get()
  },
  existingRelease () {
    let instance    = Template.instance(),
        context     = instance.context.get(),
        releaseList = Releases.find({ title: { $regex: '^' + context.title + '$', $options: 'i' } }).fetch();
    
    if (releaseList.length) {
      instance.existingRelease = releaseList[ 0 ];
      return instance.existingRelease
    } else {
      delete instance.existingRelease;
      return false
    }
  },
  importReleasesSelectorContext () {
    let context      = Template.instance().context.get(),
        project      = context.project,
        releaseRegex = new RegExp(context.title, 'i'),
        servers      = IntegrationServers.find({
          _id: {
            $in: _.uniq(project.integrations().fetch().map((integration) => {
              return integration.serverId
            }))
          }
        }).fetch(),
        versionList  = [];
    
    //console.log('releaseRegex:', releaseRegex, context);
    
    servers.forEach((server) => {
      let query          = {},
          projectLookup  = {},
          linkedVersions = _.flatten(ReleaseIntegrationLinks.find({ serverId: server._id }).fetch().map((releaseLink) => {
            return releaseLink.integrationReleaseId
          }));
      
      //console.log('Server linked versions:', server.title, linkedVersions, ReleaseIntegrationLinks.find({ }).fetch());
      
      query[ 'integrationProjects.' + server._id ] = { $exists: true };
      
      let projectIdList = Projects.find(query).fetch().map((project) => {
        let integrationProjectId              = project[ 'integrationProjects' ][ server._id ];
        projectLookup[ integrationProjectId ] = project;
        return integrationProjectId
      });
      
      //console.log('Server:', server.title, projectIdList, projectLookup);
      if (projectIdList) {
        let serverVersionList = IntegrationServerCaches.findOne({ serverId: server._id, key: 'versionList' });
        if (serverVersionList && serverVersionList.value) {
          serverVersionList.value.filter((version) => {
            return _.contains(projectIdList, version.projectId.toString()) && !_.contains(linkedVersions, version.id.toString()) && version.name.match(releaseRegex)
          }).forEach((version) => {
            let project     = projectLookup[ version.projectId ] || {};
            version.title   = version.name + ' (' + project.title + ')';
            version.project = project;
            version.server  = server;
            versionList.push(version);
          })
        }
      }
    });
    
    // Set the default value
    if (!context.linkVersions) {
      context.linkVersions = versionList.map((version) => {
        return version.id
      });
      context.versionList  = versionList;
      Template.instance().context.set(context)
    }
    
    console.log('importReleasesSelectorContext:', versionList, context.linkVersions);
    return {
      valueField  : 'id',
      displayField: 'title',
      value       : context.linkVersions,
      dataKey     : 'linkVersions',
      records     : versionList.sort((a, b) => {
        return Util.versionNumberToSortString(a.name) > Util.versionNumberToSortString(b.name) ? 1 : -1
      }),
      emptyText   : 'Select versions',
      cssClass    : 'inline',
      mode        : 'popup',
      sort        : { sort: { order: 1 } },
      query       : {}
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdminCreateReleaseWizard.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let dataKey = $(e.target).attr('data-key'),
        context = instance.context.get();
    
    if (dataKey) {
      context[ dataKey ] = newValue;
      
      // Clear some bits if the title changes
      if (dataKey === 'title') {
        delete context.linkVersions;
        delete context.versionList;
      }
      
      instance.context.set(context);
    }
  }
});

/**
 * Template Created
 */
Template.AdminCreateReleaseWizard.onCreated(() => {
  let instance = Template.instance();
  
  instance.context = new ReactiveVar({
    title        : instance.data.name,
    versionNumber: instance.data.name,
    project      : instance.data.project
  });
  
  instance.autorun(() => {
    let data = Template.currentData();
    instance.subscribe('integrations', data.project._id);
  })
});

/**
 * Template Rendered
 */
Template.AdminCreateReleaseWizard.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminCreateReleaseWizard.onDestroyed(() => {
  
});
