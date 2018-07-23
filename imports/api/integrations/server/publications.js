import { Meteor }                         from 'meteor/meteor';
import { Integrations }                   from '../integrations';
import { IntegrationCalculatedFields }    from '../integration_calculated_fields';
import { IntegrationImportFunctions }     from '../integration_import_functions';
import { IntegrationServers }             from '../integration_servers';
import { IntegrationServerCaches }        from '../integration_server_caches';
import { IntegrationServerAuthProviders } from '../integration_server_auth_providers';
import { IntegrationAgentExecutions }     from '../integration_agent_executions';

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

Meteor.publish('basic_integrations', function () {
  console.info('Publish: basic_integrations');
  if (this.userId) {
    return Integrations.find({}, { fields: { projectId: 1, serverId: 1, previewDisplayTemplate: 1, detailDisplayTemplate: 1 } });
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

Meteor.publish('all_integrations', function () {
  console.info('Publish: all_integrations');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return Integrations.find({});
    } else {
      console.warn('all_integrations requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_servers', function () {
  console.info('Publish: integration_servers');
  if (this.userId) {
    return IntegrationServers.find({}, { fields: { authData: 0 } });
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
      return IntegrationServers.find({ _id: serverId }, { fields: { authData: 0 } });
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

Meteor.publish('integration_server_caches', function (key) {
  console.info('Publish: integration_server_caches', key);
  if (this.userId && key) {
    return IntegrationServerCaches.find({ key: key });
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

Meteor.publish('integration_server_auth_providers', function (serverId) {
  console.info('Publish: integration_server_auth_providers:', serverId);
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return IntegrationServerAuthProviders.find({ serverId: serverId });
    } else {
      console.warn('integration_server_auth_providers requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_agent_executions', function (integrationId) {
  console.info('Publish: integration_agent_executions:', integrationId);
  if (this.userId && integrationId) {
    return IntegrationAgentExecutions.find({
      integrationId: integrationId
    }, { sort: { requestTime: -1 }, limit: 50 });
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

