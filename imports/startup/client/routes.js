import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import the base templates
import '../../../client/ui/layouts/unauthenticated_layout';
import '../../../client/ui/layouts/authenticated_layout';
import '../../../client/ui/layouts/report_layout';

// Import the pages
import '../../../client/ui/pages/admin/contributors/admin_contributors';
import '../../../client/ui/pages/admin/admin_home/admin_home';
import '../../../client/ui/pages/admin/calculated_fields/integration_calculated_field';
import '../../../client/ui/pages/admin/calculated_fields/integration_calculated_fields';
import '../../../client/ui/pages/admin/capacity_plan/capacity_plan';
import '../../../client/ui/pages/admin/capacity_plan/capacity_plans';
import '../../../client/ui/pages/admin/contributor_roles/contributor_role_definitions';
import '../../../client/ui/pages/admin/display_templates/display_templates';
import '../../../client/ui/pages/admin/import_export/import_export';
import '../../../client/ui/pages/admin/integration_import_functions/integration_import_function';
import '../../../client/ui/pages/admin/integration_import_functions/integration_import_functions';
import '../../../client/ui/pages/admin/integration_servers/integration_servers';
import '../../../client/ui/pages/admin/integration_servers/integration_server_browser';
import '../../../client/ui/pages/admin/projects/admin_projects';
import '../../../client/ui/pages/admin/projects/admin_project_integration';
import '../../../client/ui/pages/admin/teams/admin_teams';
import '../../../client/ui/pages/admin/users/admin_users';
import '../../../client/ui/pages/contributor/contributor_home';
import '../../../client/ui/pages/effort/effort';
import '../../../client/ui/pages/project/project_home';
import '../../../client/ui/pages/report/report_container';
import '../../../client/ui/pages/report/support/weekly_support_report';
import '../../../client/ui/pages/task/task';
import '../../../client/ui/pages/team/team_home';
import '../../../client/ui/pages/user/user_profile';

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
FlowRouter.route('/report/:templateName/:contextId', {
  name: 'Report',
  action () {
    BlazeLayout.render('ReportLayout', { main: 'ReportContainer' });
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
 * Report Routes
 *
 */
FlowRouter.route('/report/weekly_support_report/:projectId', {
  name: 'WeeklySupportReport',
  action () {
    BlazeLayout.render('ReportLayout', { main: 'WeeklySupportReport' });
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

FlowRouter.route('/admin/capacity_plans', {
  name: 'CapacityPlans',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'CapacityPlans' });
  }
});

FlowRouter.route('/admin/capacity_plan/:planId', {
  name: 'CapacityPlan',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'CapacityPlan' });
  }
});

FlowRouter.route('/admin/capacity_plan/:planId/:optionId', {
  name: 'CapacityPlanOption',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'CapacityPlan' });
  }
});

FlowRouter.route('/admin/contributor_role_definitions', {
  name: 'ContributorRoleDefinitions',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'ContributorRoleDefinitions' });
  }
});

FlowRouter.route('/admin/import_export', {
  name: 'ImportExport',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'ImportExport' });
  }
});

FlowRouter.route('/admin/display_templates', {
  name: 'DisplayTemplates',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'DisplayTemplates' });
  }
});

FlowRouter.route('/admin/display_templates/:groupId', {
  name: 'DisplayTemplateGroup',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'DisplayTemplates' });
  }
});

FlowRouter.route('/admin/display_template/:groupId/:templateId', {
  name: 'DisplayTemplate',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'DisplayTemplates' });
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