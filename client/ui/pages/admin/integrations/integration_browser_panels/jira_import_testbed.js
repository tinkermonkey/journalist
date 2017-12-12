import './jira_import_testbed.html';
import { Template } from 'meteor/templating';
import { IntegrationImportFunctions } from '../../../../../../imports/api/integrations/integration_import_functions';
import { IntegrationServers } from '../../../../../../imports/api/integrations/integration_servers';

/**
 * Template Helpers
 */
Template.JiraImportTestbed.helpers({
  integrationType () {
    let functionId     = FlowRouter.getParam('functionId'),
        importFunction = IntegrationImportFunctions.findOne(functionId);
    
    return importFunction.integrationType;
  },
  servers () {
    let functionId     = FlowRouter.getParam('functionId'),
        importFunction = IntegrationImportFunctions.findOne(functionId);
    
    return IntegrationServers.find({ integrationType: importFunction.integrationType, isActive: true });
  },
  server () {
    let serverId = Template.instance().serverId.get();
    return IntegrationServers.findOne(serverId)
  },
  result () {
    return Template.instance().result.get();
  },
  showLoading () {
    return Template.instance().showLoading.get();
  },
  error () {
    return Template.instance().error.get();
  }
});

/**
 * Template Event Handlers
 */
Template.JiraImportTestbed.events({
  'click .server-dropdown li' (e, instance) {
    let server = this;
    
    console.log('Selected:', server);
    instance.serverId.set(server._id);
  },
  'click .btn-load' (e, instance) {
    let showLoading = instance.showLoading.get();
    
    // If the loading spinner is shown, just sit tight
    if (!showLoading) {
      // Convert the payload to JSON
      instance.doorbell.set(Date.now());
    }
  }
});

/**
 * Template Created
 */
Template.JiraImportTestbed.onCreated(() => {
  let instance = Template.instance();
  
  instance.result      = new ReactiveVar();
  instance.doorbell    = new ReactiveVar(Date.now());
  instance.error       = new ReactiveVar();
  instance.serverId    = new ReactiveVar();
  instance.showLoading = new ReactiveVar(false);
  
  instance.autorun(() => {
    let functionId = FlowRouter.getParam('functionId'),
        doorBell   = instance.doorbell.get(),
        serverId   = instance.serverId.get();
    
    // Fetch the project list
    if (serverId) {
      let itemKey = instance.$('.input-item-key').val();
      if (itemKey) {
        console.log('JiraImportTestbed fetching results for', serverId, doorBell, itemKey);
        instance.showLoading.set(true);
        Meteor.call('testIntegrationImportFunction', functionId, serverId, itemKey, (error, response) => {
          instance.showLoading.set(false);
          if (error) {
            console.error('JiraImportTestbed fetchData failed:', error);
            instance.error.set(error);
            instance.result.set();
          } else {
            instance.error.set();
            instance.result.set(response);
          }
        });
      }
    }
  })
});

/**
 * Template Rendered
 */
Template.JiraImportTestbed.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.JiraImportTestbed.onDestroyed(() => {
  
});
