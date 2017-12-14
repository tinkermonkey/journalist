import './integration_server_field_reference.html';
import { Template } from 'meteor/templating';
import { IntegrationServers } from '../../../../../imports/api/integrations/integration_servers';
import { IntegrationServerCaches } from '../../../../../imports/api/integrations/integration_server_caches';

/**
 * Template Helpers
 */
Template.IntegrationServerFieldReference.helpers({
  servers () {
    let context = this.context,
        query   = { isActive: true };
    
    if (context && context.integrationType) {
      query.integrationType = context.integrationType;
    }
    
    return IntegrationServers.find(query, { sort: { title: 1 } });
  },
  server () {
    let serverId = Template.instance().serverId.get();
    if (serverId) {
      return IntegrationServers.findOne(serverId)
    } else {
      let context = this.context,
          query   = { isActive: true };
      
      if (context && context.integrationType) {
        query.integrationType = context.integrationType;
      }
      
      let server = IntegrationServers.findOne(query, { sort: { title: 1 } });
      
      if (server) {
        Template.instance().serverId.set(server._id)
      }
    }
  },
  searchResults () {
    return Template.instance().searchResults.get()
  },
  searchTerm () {
    return Template.instance().searchTerm.get()
  },
  cachedFieldList () {
    let serverId = Template.instance().serverId.get();
    if (serverId) {
      return IntegrationServerCaches.findOne({ serverId: serverId, key: 'fieldList' })
    }
  }
});

/**
 * Template Event Handlers
 */
Template.IntegrationServerFieldReference.events({
  'click .server-dropdown li' (e, instance) {
    let server = this;
    
    instance.serverId.set(server._id);
  },
  'keyup .input-field-search' (e, instance) {
    let searchTerm = instance.$('.input-field-search').val(),
        serverId   = instance.serverId.get();
    
    if (searchTerm.length > 1) {
      instance.searchTerm.set(searchTerm);
      clearTimeout(instance.searchTimeout);
      instance.searchTimeout = setTimeout(() => {
        let cache = IntegrationServerCaches.findOne({ serverId: serverId, key: 'fieldList' });
        if (cache) {
          let startTime = Date.now(),
              search    = new RegExp(searchTerm, 'i'),
              results   = cache.value.filter((fieldDef) => {
                //console.log(fieldDef.name, fieldDef.name.match(search), fieldDef.key, fieldDef.key.match(search));
                return fieldDef.name.match(search) !== null || fieldDef.key.match(search) !== null
              });
          instance.searchResults.set(results);
          console.log('Searched', cache.value.length, 'fields for', searchTerm, 'in', (Date.now() - startTime), 'ms producing', results.length, 'matches');
        }
      }, 100);
    } else {
      instance.searchResults.set();
      instance.searchTerm.set();
    }
  },
  'submit .navbar-form' (e, instance) {
    e.preventDefault();
  }
});

/**
 * Template Created
 */
Template.IntegrationServerFieldReference.onCreated(() => {
  let instance = Template.instance();
  
  instance.serverId      = new ReactiveVar();
  instance.searchResults = new ReactiveVar();
  instance.searchTerm    = new ReactiveVar();
  
  instance.autorun(() => {
    let serverId = instance.serverId.get();
    
    instance.subscribe('integration_servers');
    instance.subscribe('integration_server', serverId);
    instance.subscribe('integration_server_cache', serverId);
  })
});

/**
 * Template Rendered
 */
Template.IntegrationServerFieldReference.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.IntegrationServerFieldReference.onDestroyed(() => {
  
});
