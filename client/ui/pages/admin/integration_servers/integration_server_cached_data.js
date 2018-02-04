import './integration_server_cached_data.html';
import { Template }                from 'meteor/templating';
import { RobaDialog }              from 'meteor/austinsand:roba-dialog';
import { IntegrationServerCaches } from '../../../../../imports/api/integrations/integration_server_caches';
import { Util }                    from '../../../../../imports/api/util';

/**
 * Template Helpers
 */
Template.IntegrationServerCachedData.helpers({
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
Template.IntegrationServerCachedData.events({
  'click .btn-update-cache' (e, instance) {
    let serverId = FlowRouter.getParam('serverId');
    Meteor.call('updateIntegrationServerCache', serverId, function (error, response) {
      if (error) {
        RobaDialog.error('Cache update failed: ' + error.message);
      }
    });
  }
});

/**
 * Template Created
 */
Template.IntegrationServerCachedData.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.IntegrationServerCachedData.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IntegrationServerCachedData.onDestroyed(() => {
  
});
