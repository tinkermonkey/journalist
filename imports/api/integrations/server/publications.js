import { Meteor } from 'meteor/meteor';
import { Integrations } from '../integrations';
import { IntegrationCalculatedFields } from '../integration_calculated_fields';
import { IntegrationDisplayTemplates } from '../integration_display_templates';
import { IntegrationImportFunctions } from '../integration_import_functions';
import { IntegrationServers } from '../integration_servers';
import { IntegrationServerCaches } from '../integration_server_caches';
import { PublishedDisplayTemplates } from '../published_display_templates';

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

Meteor.publish('integration', function (integrationId) {
  console.info('Publish: integration', integrationId);
  if (this.userId && integrationId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return Integrations.find({ _id: integrationId });
    } else {
      console.warn('integration requested by non-admin:', this.userId, user && user.username)
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
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return IntegrationDisplayTemplates.find({});
    } else {
      console.warn('integration_display_templates requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('published_display_templates', function () {
  console.info('Publish: published_display_templates');
  if (this.userId) {
    return PublishedDisplayTemplates.find({});
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_calculated_fields', function () {
  console.info('Publish: integration_calculated_fields');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return IntegrationCalculatedFields.find({});
    } else {
      console.warn('integration_calculated_fields requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_calculated_field', function (calculatedFieldId) {
  console.info('Publish: integration_calculated_field', calculatedFieldId);
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return IntegrationCalculatedFields.find({ _id: calculatedFieldId });
    } else {
      console.warn('integration_calculated_fields requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});
