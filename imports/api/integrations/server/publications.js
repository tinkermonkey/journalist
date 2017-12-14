import { Meteor } from 'meteor/meteor';
import { Integrations } from '../integrations';
import { IntegrationDisplayTemplates } from '../integration_display_templates';
import { IntegrationImportFunctions } from '../integration_import_functions';
import { IntegrationServers } from '../integration_servers';
import { IntegrationServerCaches } from '../integration_server_caches';

Meteor.publish('integrations', function (projectId) {
  console.info('Publish: integrations', projectId);
  if (this.userId && projectId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return Integrations.find({ projectId: projectId });
    } else {
      console.warn('integrations requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_servers', function () {
  console.info('Publish: integration_servers');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return IntegrationServers.find({});
    } else {
      console.warn('integration_servers requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_server', function (serverId) {
  console.info('Publish: integration_server', serverId);
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return IntegrationServers.find({ _id: serverId });
    } else {
      console.warn('integration_servers requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_server_cache', function (serverId) {
  console.info('Publish: integration_server_cache', serverId);
  if (this.userId) {
    return IntegrationServerCaches.find({ serverId: serverId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_import_functions', function () {
  console.info('Publish: integration_import_functions');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return IntegrationImportFunctions.find({});
    } else {
      console.warn('integration_import_functions requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_import_function', function (importFunctionId) {
  console.info('Publish: integration_import_function', importFunctionId);
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return IntegrationImportFunctions.find({ _id: importFunctionId });
    } else {
      console.warn('integration_import_functions requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_display_templates', function () {
  console.info('Publish: integration_display_templates');
  if (this.userId) {
    return IntegrationDisplayTemplates.find({});
  } else {
    this.ready();
    return [];
  }
});
