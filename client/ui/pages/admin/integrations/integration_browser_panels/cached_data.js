import './cached_data.html';
import { Template } from 'meteor/templating';
import { IntegrationServerCaches } from '../../../../../../imports/api/integrations/integration_server_caches';
import { Util } from '../../../../../../imports/api/util';

/**
 * Template Helpers
 */
Template.CachedData.helpers({
  cachedItems () {
    let serverId = FlowRouter.getParam('serverId');
    if (serverId) {
      return IntegrationServerCaches.find({ serverId: serverId });
    }
  },
  getTabTitle () {
    let cachedItem = this;
    return Util.camelToTitle(cachedItem.key);
  }
});

/**
 * Template Event Handlers
 */
Template.CachedData.events({
  'click .btn-update-cache' (e, instance) {
    let serverId = FlowRouter.getParam('serverId');
    Meteor.call('updateIntegrationServerCache', serverId, function (error, response) {
      if (error) {
        RobaDialog.error("Cache update failed: " + error.message);
      }
    });
  }
});

/**
 * Template Created
 */
Template.CachedData.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.CachedData.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.CachedData.onDestroyed(() => {
  
});
