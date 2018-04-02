import './admin_release.html';
import { Template }                from 'meteor/templating';
import { ImportedItemWorkPhases }  from '../../../../../imports/api/imported_items/imported_item_work_phases';
import { IntegrationServerCaches } from '../../../../../imports/api/integrations/integration_server_caches';
import { IntegrationServers }      from '../../../../../imports/api/integrations/integration_servers';
import { Projects }                from '../../../../../imports/api/projects/projects';
import { Releases }                from '../../../../../imports/api/releases/releases';
import { ReleaseIntegrationLinks } from '../../../../../imports/api/releases/release_integration_links';
import { Util }                    from '../../../../../imports/api/util';
import '../../releases/release_items_fixed';
import '../../releases/release_items_found';

/**
 * Template Helpers
 */
Template.AdminRelease.helpers({
  release () {
    let releaseId = FlowRouter.getParam('releaseId');
    return Releases.findOne(releaseId)
  },
  integrationProjects () {
    return Projects.find({ integrationProjects: { $exists: true } }, { sort: { title: 1 } })
  },
  releaseProjects () {
    let releaseId  = FlowRouter.getParam('releaseId'),
        projectIds = _.uniq(ReleaseIntegrationLinks.find({
          releaseId: releaseId
        }).map((releaseLink) => {
          return releaseLink.projectId
        }));
    
    return Projects.find({ _id: { $in: projectIds } }, { sort: { title: 1 } })
  },
  integrationVersionSelectorContext (server) {
    let releaseId            = FlowRouter.getParam('releaseId'),
        project              = this,
        integrationProjectId = project.integrationProjects[ server._id ],
        serverVersionList    = IntegrationServerCaches.findOne({ serverId: server._id, key: 'versionList' }),
        versionList          = [],
        currentMapping       = ReleaseIntegrationLinks.findOne({
          serverId : server._id,
          projectId: project._id,
          releaseId: releaseId
        }) || {};
    
    if (integrationProjectId && serverVersionList.value.length) {
      versionList = serverVersionList.value.filter((version) => {
        // This needs to not be strictly equal because we're comparing a string to maybe a number
        return version.projectId == integrationProjectId
      });
    }
    
    //console.log('integrationVersionSelectorContext:', project.title, currentMapping.integrationReleaseId);
    return {
      valueField  : 'id',
      displayField: 'name',
      value       : currentMapping.integrationReleaseId,
      dataKey     : 'linkVersion',
      records     : versionList,
      emptyText   : 'Select versions',
      cssClass    : 'inline',
      mode        : 'popup',
      sort        : { sort: { order: 1 } },
      query       : {}
    }
  },
  suggestedLinks (server, release) {
    let project              = this,
        integrationProjectId = project.integrationProjects[ server._id ],
        serverVersionList    = IntegrationServerCaches.findOne({ serverId: server._id, key: 'versionList' }),
        versionList          = [],
        releaseRegex         = new RegExp(release.title, 'i'),
        currentMapping       = ReleaseIntegrationLinks.findOne({
          serverId : server._id,
          projectId: project._id,
          releaseId: release._id
        }) || { integrationReleaseId: [] };
    
    if (integrationProjectId && serverVersionList.value.length) {
      versionList = serverVersionList.value.filter((version) => {
        // This needs to not be strictly equal because we're comparing a string to maybe a number
        return version.projectId == integrationProjectId && version.name.match(releaseRegex)
      }).filter((version) => {
        return !_.contains(currentMapping.integrationReleaseId, version.id)
      }).map((version) => {
        version.projectId      = project._id;
        version.releaseId      = release._id;
        version.serverId       = server._id;
        version.currentMapping = currentMapping;
        
        return version
      });
    }
    
    return versionList
  },
  servers () {
    return IntegrationServers.find({}, { sort: { title: 1 } }).fetch().filter((server) => {
      let query = {};
      
      query[ 'integrationProjects.' + server._id ] = { $exists: true };
      return Projects.find(query).count() > 0
    })
  },
  workPhases () {
    return _.keys(ImportedItemWorkPhases).map((key) => {
      return {
        value: ImportedItemWorkPhases[ key ],
        key  : key,
        title: Util.camelToTitle(key)
      }
    })
  },
  workPhaseItemTableContext (project, release) {
    let workPhase = this;
    
    console.log('workPhaseItemTableContext:', workPhase, project, release);
    
    return {
      query: {
        projectId: project._id,
        workPhase: workPhase.value,
        versionsFixed: release._id
      }
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdminRelease.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let releaseId = $(e.target).closest('.release-container').attr('data-pk'),
        dataKey   = $(e.target).attr('data-key');
    
    console.log('AdminReleaseTable edited:', releaseId, dataKey, newValue);
    if (releaseId && dataKey) {
      if (dataKey === 'linkVersion') {
        let serverId  = $(e.target).closest('.server-container').attr('data-pk'),
            projectId = $(e.target).closest('.project-container').attr('data-pk');
        
        Meteor.call('linkIntegrationRelease', releaseId, serverId, projectId, newValue, (error, response) => {
          if (error) {
            RobaDialog.error('Linking release failed:' + error.toString());
          }
        });
      } else {
        Meteor.call('editRelease', releaseId, dataKey, newValue, (error, response) => {
          if (error) {
            RobaDialog.error('Update failed:' + error.toString());
          }
        });
      }
    }
  },
  'click .add-suggested-release' (e, instance) {
    let suggestion = this,
        newValue   = suggestion.currentMapping.integrationReleaseId,
        releaseId  = suggestion.releaseId,
        serverId   = suggestion.serverId,
        projectId  = suggestion.projectId;
    
    newValue.push(suggestion.id);
    console.log('Suggested Release:', releaseId, serverId, projectId, newValue);
    
    if (releaseId && serverId && projectId && newValue && newValue.length) {
      Meteor.call('linkIntegrationRelease', releaseId, serverId, projectId, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Linking release failed:' + error.toString());
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.AdminRelease.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let projectId = FlowRouter.getParam('projectId');
    
    instance.subscribe('integrations', projectId);
    instance.subscribe('integration_servers');
    instance.subscribe('integration_server_caches', 'versionList');
  });
});

/**
 * Template Rendered
 */
Template.AdminRelease.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminRelease.onDestroyed(() => {
  
});
