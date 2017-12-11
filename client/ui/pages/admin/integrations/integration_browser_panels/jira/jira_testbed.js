import './jira_testbed.html';
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
  formatResult(data){
    if (data) {
      return JSON.stringify(data, null, '\t')
    }
  },
  showLoading () {
    return Template.instance().showLoading.get();
  },
  error () {
    return Template.instance().error.get();
  },
  module () {
    return Template.instance().module.get();
  },
  method () {
    return Template.instance().method.get();
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
    instance.doorbell.set(Date.now());
  },
  'click .btn-load' (e, instance) {
    let showLoading = instance.showLoading.get(),
        module      = instance.$(".input-module").val(),
        method      = instance.$(".input-method").val(),
        payload     = instance.$(".input-payload").val();
    
    // If the loading spinner is shown, just sit tight
    if (!showLoading) {
      console.log('Loading data:', module, method, payload);
      
      // Convert the payload to JSON
      if (payload && payload.length) {
        try {
          payload = JSON.parse(payload);
        } catch (e) {
          console.error('Parsing payload failed:', payload, e);
          instance.error.set('Parsing payload failed: ' + e.toString());
          return;
        }
      } else {
        //payload = null;
      }
      
      instance.module.set(module);
      instance.method.set(method);
      instance.payload.set(payload);
      instance.run.set(true);
    }
  }
});

/**
 * Template Created
 */
Template.JiraTestbed.onCreated(() => {
  let instance = Template.instance();
  
  instance.results     = new ReactiveVar([]);
  instance.doorbell    = new ReactiveVar(Date.now());
  instance.error       = new ReactiveVar();
  instance.showLoading = new ReactiveVar(false);
  instance.module      = new ReactiveVar();
  instance.method      = new ReactiveVar();
  instance.payload     = new ReactiveVar();
  instance.run         = new ReactiveVar(false);
  
  instance.autorun(() => {
    let serverId = FlowRouter.getParam('serverId'),
        doorBell = instance.doorbell.get(),
        module   = instance.module.get(),
        method   = instance.method.get(),
        payload  = instance.payload.get(),
        run      = instance.run.get();
    
    // Fetch the project list
    if (run && module && module.length && method && method.length) {
      console.log('JiraTestbed fetching results for', serverId, doorBell);
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
