import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import the base templates
import '../../../client/ui/layouts/unauthenticated_layout.js';
import '../../../client/ui/layouts/authenticated_layout.js';

// Import the pages
import '../../../client/ui/pages/admin/contributors/admin_contributors.js';
import '../../../client/ui/pages/admin/admin_home/admin_home.js';
import '../../../client/ui/pages/admin/calculated_fields/integration_calculated_field.js';
import '../../../client/ui/pages/admin/calculated_fields/integration_calculated_fields.js';
import '../../../client/ui/pages/admin/contributor_roles/contributor_role_definitions.js';
import '../../../client/ui/pages/admin/display_templates/integration_display_template.js';
import '../../../client/ui/pages/admin/display_templates/integration_display_templates.js';
import '../../../client/ui/pages/admin/integration_import_functions/integration_import_function.js';
import '../../../client/ui/pages/admin/integration_import_functions/integration_import_functions.js';
import '../../../client/ui/pages/admin/integration_servers/integration_servers.js';
import '../../../client/ui/pages/admin/integration_servers/integration_server_browser.js';
import '../../../client/ui/pages/admin/projects/admin_projects.js';
import '../../../client/ui/pages/admin/projects/admin_project_integration.js';
import '../../../client/ui/pages/admin/teams/admin_teams.js';
import '../../../client/ui/pages/admin/users/admin_users.js';
import '../../../client/ui/pages/contributor/contributor_home.js';
import '../../../client/ui/pages/effort/effort.js';
import '../../../client/ui/pages/project/project_home.js';
import '../../../client/ui/pages/task/task.js';
import '../../../client/ui/pages/team/team_home.js';
import '../../../client/ui/pages/user/user_profile.js';

// Set the layout root element
BlazeLayout.setRoot('body');

// Unauthenticated Routes
FlowRouter.route('/login', {
  name: 'Login',
  action () {
    BlazeLayout.render('UnauthenticatedLayout', { main: 'Login' });
  }
});

FlowRouter.route('/logout', {
  name: 'Logout',
  action () {
    Meteor.logout();
    setTimeout(() => {
      FlowRouter.go('/');
    }, 10);
  }
});

/**
 *
 * Authenticated Routes
 *
 */
FlowRouter.route('/', {
  name: 'Home',
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'ContributorHome' });
  }
});
FlowRouter.route('/contributor/:contributorId', {
  name: 'ContributorHome',
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'ContributorHome' });
  }
});
FlowRouter.route('/effort/:effortId', {
  name: 'Effort',
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'Effort' });
  }
});
FlowRouter.route('/project/:projectId', {
  name: 'ProjectHome',
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'ProjectHome' });
  }
});
FlowRouter.route('/task/:taskId', {
  name: 'Task',
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'Task' });
  }
});
FlowRouter.route('/team/:teamId', {
  name: 'TeamHome',
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'TeamHome' });
  }
});

FlowRouter.route('/user_profile', {
  name: 'UserProfile',
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'UserProfile' });
  }
});

/**
 *
 * Admin Routes
 *
 */
FlowRouter.route('/admin/contributors', {
  name: 'AdminContributors',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'AdminContributors' });
  }
});

FlowRouter.route('/admin/home', {
  name: 'AdminHome',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'AdminHome' });
  }
});

FlowRouter.route('/admin/integration_servers', {
  name: 'IntegrationServers',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'IntegrationServers' });
  }
});

FlowRouter.route('/admin/integration_server_browser/:serverId', {
  name: 'IntegrationServerBrowser',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'IntegrationServerBrowser' });
  }
});

FlowRouter.route('/admin/contributor_role_definitions', {
  name: 'ContributorRoleDefinitions',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'ContributorRoleDefinitions' });
  }
});

FlowRouter.route('/admin/integration_display_templates', {
  name: 'IntegrationDisplayTemplates',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'IntegrationDisplayTemplates' });
  }
});

FlowRouter.route('/admin/integration_display_template/:templateId', {
  name: 'IntegrationDisplayTemplate',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'IntegrationDisplayTemplate' });
  }
});

FlowRouter.route('/admin/integration_import_functions', {
  name: 'IntegrationImportFunctions',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'IntegrationImportFunctions' });
  }
});

FlowRouter.route('/admin/integration_import_function/:functionId', {
  name: 'IntegrationImportFunction',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'IntegrationImportFunction' });
  }
});

FlowRouter.route('/admin/integration_calculated_fields', {
  name: 'IntegrationCalculatedFields',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'IntegrationCalculatedFields' });
  }
});

FlowRouter.route('/admin/integration_calculated_field/:fieldId', {
  name: 'IntegrationCalculatedField',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'IntegrationCalculatedField' });
  }
});

FlowRouter.route('/admin/projects', {
  name: 'AdminProjects',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'AdminProjects' });
  }
});

FlowRouter.route('/admin/project/:projectId', {
  name: 'AdminProjectHome',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'AdminProjectHome' });
  }
});

FlowRouter.route('/admin/project_integration/:integrationId', {
  name: 'AdminProjectIntegration',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'AdminProjectIntegration' });
  }
});

FlowRouter.route('/admin/teams', {
  name: 'AdminTeams',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'AdminTeams' });
  }
});

FlowRouter.route('/admin/users', {
  name: 'AdminUsers',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'AdminUsers' });
  }
});

// Handle bad routes
FlowRouter.notFound = {
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'NotFound' });
  },
};