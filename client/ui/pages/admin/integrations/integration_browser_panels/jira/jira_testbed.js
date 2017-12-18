import './jira_testbed.html';
import './jira_testbed.css';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.JiraTestbed.helpers({
  results () {
    let results = Template.instance().results.get();
    if (_.isArray(results)) {
      return results
    } else {
      return [ results ]
    }
  },
  showLoading () {
    return Template.instance().showLoading.get();
  },
  error () {
    return Template.instance().error.get();
  },
  callMap () {
    return Template.instance().callMap.get();
  },
  module () {
    return Template.instance().module.get();
  },
  modules () {
    let callMap = Template.instance().callMap.get();
    return callMap && callMap.map((module) => {
      return module.name
    })
  },
  method () {
    return Template.instance().method.get();
  },
  methods () {
    let moduleSelection = Template.instance().module.get(),
        callMap         = Template.instance().callMap.get();
    
    if (moduleSelection && callMap) {
      let moduleDef = callMap && callMap.find((module) => {
        return module.name === moduleSelection
      });
      if (moduleDef) {
        return moduleDef.methods
      }
    }
  },
  payload () {
    return Template.instance().payload.get();
  }
});

/**
 * Template Event Handlers
 */
Template.JiraTestbed.events({
  'click .btn-refresh' (e, instance) {
    instance.run.set(true);
  },
  'click .btn-load' (e, instance) {
    let showLoading = instance.showLoading.get(),
        module      = instance.module.get(),
        method      = instance.method.get(),
        payload     = instance.$(".input-payload").val();
    
    // If the loading spinner is shown, just sit tight
    if (!showLoading) {
      console.log('JiraTestbed .btn-load click loading data:', module, method, payload);
      
      // Convert the payload to JSON
      if (payload && payload.length) {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          console.error('Parsing payload failed:', payload, e);
          instance.error.set('Parsing payload failed: ' + e.toString());
          return;
        }
        
        instance.payload.set(payload);
        instance.run.set(true);
      }
    }
  },
  'click .module-dropdown li' (e, instance) {
    let moduleName = this.toString(),
        callMap    = instance.callMap.get();
    
    console.log('JiraTestbed module selection:', moduleName);
    if (moduleName) {
      let module = callMap.find((module) => {
        return module.name === moduleName
      });
      if (module) {
        instance.module.set(moduleName);
      }
    }
  },
  'click .method-dropdown li' (e, instance) {
    let methodName = this.toString(),
        moduleName = instance.module.get(),
        callMap    = instance.callMap.get();
    
    console.log('JiraTestbed method selection:', methodName, moduleName);
    if (moduleName && methodName) {
      let module = callMap.find((module) => {
        return module.name === moduleName
      });
      if (module && _.contains(module.methods, methodName)) {
        instance.method.set(methodName);
      } else {
        console.error('JiraTestbed unable to locate method', methodName, 'in module', moduleName, ':', module);
      }
    }
  },
  'submit .navbar-testbed form'(e, instance){
    e.preventDefault();
    $('.navbar-testbed .btn-load').trigger('click');
  }
});

/**
 * Template Created
 */
Template.JiraTestbed.onCreated(() => {
  let instance = Template.instance();
  
  instance.results      = new ReactiveVar([]);
  instance.error        = new ReactiveVar();
  instance.showLoading  = new ReactiveVar(false);
  instance.module       = new ReactiveVar();
  instance.method       = new ReactiveVar();
  instance.payload      = new ReactiveVar();
  instance.run          = new ReactiveVar(false);
  instance.callMap      = new ReactiveVar();
  instance.callMapError = new ReactiveVar();
  
  // Load the call map
  
  instance.autorun(() => {
    let serverId = FlowRouter.getParam('serverId'),
        callMap  = instance.callMap.get();
    
    console.log('JiraTestbed callMap autorun');
    if (callMap == null) {
      console.log('JiraTestbed callMap autorun - fetching call map');
      Meteor.call('getIntegrationServerCallMap', serverId, (error, response) => {
        if (error) {
          console.error('getIntegrationServerCallMap failed:', error);
          instance.callMapError.set(error);
          instance.callMap.set();
        } else {
          console.info('getIntegrationServerCallMap result:', response);
          instance.callMapError.set();
          instance.callMap.set(response);
        }
      });
    }
  });
  
  // Act on the user input
  instance.autorun(() => {
    let serverId = FlowRouter.getParam('serverId'),
        module   = instance.module.get(),
        method   = instance.method.get(),
        payload  = instance.payload.get(),
        run      = instance.run.get();
    
    // Fetch the project list
    if (run && module && module.length && method && method.length) {
      console.log('JiraTestbed fetching results:', serverId, module, method, payload);
      instance.run.set(false);
      instance.showLoading.set(true);
      Meteor.call('fetchIntegrationServerData', serverId, { module: module, method: method, payload: payload }, (error, response) => {
        instance.showLoading.set(false);
        if (error) {
          console.error('fetchData failed:', error);
          instance.error.set(error);
          instance.results.set([]);
        } else {
          instance.error.set();
          instance.results.set(response);
        }
      });
    } else {
      console.log('JiraTestbed no action on autorun:', serverId, module, method, payload);
    }
  })
});

/**
 * Template Rendered
 */
Template.JiraTestbed.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.JiraTestbed.onDestroyed(() => {
  
});
