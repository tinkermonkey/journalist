import './jira_import_testbed.html';
import { Template }                   from 'meteor/templating';
import { IntegrationImportFunctions } from '../../../../../../../imports/api/integrations/integration_import_functions';
import { IntegrationServers }         from '../../../../../../../imports/api/integrations/integration_servers';
import { Projects }                   from '../../../../../../../imports/api/projects/projects';

/**
 * Template Helpers
 */
Template.JiraImportTestbed.helpers({
  integrationType () {
    let functionId     = Template.instance().functionId.get(),
        importFunction = IntegrationImportFunctions.findOne(functionId);
    
    return importFunction && importFunction.integrationType;
  },
  servers () {
    let functionId     = Template.instance().functionId.get(),
        importFunction = IntegrationImportFunctions.findOne(functionId);
    
    if (importFunction) {
      return IntegrationServers.find({ integrationType: importFunction.integrationType, isActive: true }, { sort: { title: 1 } });
    }
  },
  server () {
    let serverId = Template.instance().serverId.get();
    if (serverId) {
      return IntegrationServers.findOne(serverId)
    } else {
      let functionId     = Template.instance().functionId.get(),
          importFunction = IntegrationImportFunctions.findOne(functionId),
          server         = IntegrationServers.findOne({
            integrationType: importFunction.integrationType,
            isActive       : true
          }, { sort: { isAuthenticated: -1, title: 1 } });
      if (server) {
        Template.instance().serverId.set(server._id)
      }
    }
  },
  projects () {
    return Projects.find({}, { sort: { title: 1 } })
  },
  project () {
    let projectId = Template.instance().projectId.get();
    if (projectId) {
      return Projects.findOne(projectId)
    } else {
      let project = Projects.findOne({}, { sort: { title: 1 } });
      if (project) {
        Template.instance().projectId.set(project._id)
      }
    }
  },
  functionId () {
    return Template.instance().functionId.get();
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
  'click .project-dropdown li' (e, instance) {
    let project = this;
    
    console.log('Selected:', project);
    instance.projectId.set(project._id);
  },
  'click .btn-load' (e, instance) {
    let showLoading = instance.showLoading.get();
    
    // If the loading spinner is shown, just sit tight
    if (!showLoading) {
      // Convert the payload to JSON
      instance.doorbell.set(Date.now());
    }
  },
  'submit .navbar-form' (e, instance) {
    e.preventDefault();
    instance.$('.btn-load').trigger('click')
  }
});

/**
 * Template Created
 */
Template.JiraImportTestbed.onCreated(() => {
  let instance = Template.instance();
  
  instance.result             = new ReactiveVar();
  instance.doorbell           = new ReactiveVar(Date.now());
  instance.error              = new ReactiveVar();
  instance.functionId         = new ReactiveVar();
  instance.serverId           = new ReactiveVar();
  instance.projectId          = new ReactiveVar();
  instance.showLoading        = new ReactiveVar(false);
  instance.calculatedFieldIds = new ReactiveVar();
  
  instance.autorun(() => {
    let context = Template.currentData().context;
    
    if (context) {
      // Scrub the context for a function _id
      if (context.functionId || context.importFunctionId) {
        instance.functionId.set(context.functionId || context.importFunctionId);
      } else {
        // Try pulling it out of the url
        let functionId = FlowRouter.getParam('functionId');
        if (functionId) {
          instance.functionId.set(functionId);
        } else {
          console.error('JiraImportTestbed: cannot determine function context');
          return;
        }
      }
      
      // Pull the serverId out of the context if it exists
      if (context.serverId) {
        instance.serverId.set(context.serverId);
      }
      
      // Pull the calculatedFieldIds out of the context if it exists
      if (context.calculatedFieldIds) {
        instance.calculatedFieldIds.set(context.calculatedFieldIds);
      }
    }
  });
  
  instance.autorun(() => {
    let functionId         = instance.functionId.get(),
        doorBell           = instance.doorbell.get(),
        serverId           = instance.serverId.get(),
        projectId          = instance.projectId.get(),
        calculatedFieldIds = instance.calculatedFieldIds.get();
    
    if (serverId && functionId && instance.isRendered) {
      let itemKey = instance.$('.input-item-key').val();
      if (itemKey) {
        console.log('JiraImportTestbed fetching results for', serverId, doorBell, itemKey, projectId, calculatedFieldIds);
        instance.showLoading.set(true);
        Meteor.call('testIntegrationImportFunction', functionId, serverId, itemKey, projectId, calculatedFieldIds, (error, response) => {
          instance.showLoading.set(false);
          if (error) {
            console.error('JiraImportTestbed fetchData failed:', error);
            instance.error.set(error);
            instance.result.set();
          } else {
            console.info('JiraImportTestbed fetchData:', response);
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
  let instance = Template.instance();
  
  instance.isRendered = true;
});

/**
 * Template Destroyed
 */
Template.JiraImportTestbed.onDestroyed(() => {
  
});
