import { Meteor }                         from 'meteor/meteor';
import { logger }                         from 'meteor/austinsand:journalist-logger';
import { Integrations }                   from '../integrations';
import { IntegrationCalculatedFields }    from '../integration_calculated_fields';
import { IntegrationImportFunctions }     from '../integration_import_functions';
import { IntegrationServers }             from '../integration_servers';
import { IntegrationServerCaches }        from '../integration_server_caches';
import { IntegrationServerAuthProviders } from '../integration_server_auth_providers';

Meteor.publish('integrations', function (projectId) {
  logger.info('Publish: integrations', projectId);
  if (this.userId && projectId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return Integrations.find({ projectId: projectId });
    } else {
      logger.warn('integrations requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration', function (integrationId) {
  logger.info('Publish: integration', integrationId);
  if (this.userId && integrationId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return Integrations.find({ _id: integrationId });
    } else {
      logger.warn('integration requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_servers', function () {
  logger.info('Publish: integration_servers');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return IntegrationServers.find({});
    } else {
      logger.warn('integration_servers requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_server', function (serverId) {
  logger.info('Publish: integration_server', serverId);
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return IntegrationServers.find({ _id: serverId });
    } else {
      logger.warn('integration_servers requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_server_cache', function (serverId) {
  logger.info('Publish: integration_server_cache', serverId);
  if (this.userId) {
    return IntegrationServerCaches.find({ serverId: serverId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_import_functions', function () {
  logger.info('Publish: integration_import_functions');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return IntegrationImportFunctions.find({});
    } else {
      logger.warn('integration_import_functions requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_import_function', function (importFunctionId) {
  logger.info('Publish: integration_import_function', importFunctionId);
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return IntegrationImportFunctions.find({ _id: importFunctionId });
    } else {
      logger.warn('integration_import_functions requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_calculated_fields', function () {
  logger.info('Publish: integration_calculated_fields');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return IntegrationCalculatedFields.find({});
    } else {
      logger.warn('integration_calculated_fields requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_calculated_field', function (calculatedFieldId) {
  logger.info('Publish: integration_calculated_field', calculatedFieldId);
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return IntegrationCalculatedFields.find({ _id: calculatedFieldId });
    } else {
      logger.warn('integration_calculated_fields requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_server_auth_providers', function (serverId) {
  logger.info('Publish: integration_server_auth_providers:', serverId);
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return IntegrationServerAuthProviders.find({ serverId: serverId });
    } else {
      logger.warn('integration_server_auth_providers requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('enabled_auth_providers', function () {
  return IntegrationServerAuthProviders.find({
    isEnabled: true
  }, {
    fields: { loginFunctionName: 1 }
  });
});
