import './integration_server_status_reference.html';
import { Template }           from 'meteor/templating';
import { IntegrationServers } from '../../../../../imports/api/integrations/integration_servers';

/**
 * Template Helpers
 */
Template.IntegrationServerStatusReference.helpers({
  statusList () {
    let statusList = Template.instance().statusList.get();
    if (statusList) {
      return _.sortBy(statusList, 'title')
    }
  }
});

/**
 * Template Event Handlers
 */
Template.IntegrationServerStatusReference.events({});

/**
 * Template Created
 */
Template.IntegrationServerStatusReference.onCreated(() => {
  let instance = Template.instance();
  
  instance.statusList = new ReactiveVar();
  instance.subscribe('integration_servers');
  
  instance.autorun(() => {
    let context = Template.currentData();
    
    if (context && context.serverId) {
      let server = IntegrationServers.findOne(context.serverId);
      if (server && server.isAuthenticated) {
        Meteor.call('getIntegrationServerStatusList', context.serverId, (error, response) => {
          if (error) {
            console.error('getIntegrationServerStatusList failed:', error);
          } else {
            console.log('getIntegrationServerStatusList returned:', response);
            instance.statusList.set(response);
          }
        });
      }
    } else {
      console.error('IntegrationServerStatusReference passed no serverId');
    }
  })
});

/**
 * Template Rendered
 */
Template.IntegrationServerStatusReference.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IntegrationServerStatusReference.onDestroyed(() => {
  
});
