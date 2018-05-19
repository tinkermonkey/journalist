import { Meteor }      from 'meteor/meteor';
import { FlowRouter }  from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
// Import the base templates
import '../../../client/ui/layouts/unauthenticated_layout';
import '../../../client/ui/layouts/anonymous_layout';
import '../../../client/ui/layouts/authenticated_layout';
import '../../../client/ui/layouts/report_layout';
// Import the pages
import '../../../client/ui/pages/admin/contributors/admin_contributor';
import '../../../client/ui/pages/admin/contributors/admin_contributors';
import '../../../client/ui/pages/admin/admin_home/admin_home';
import '../../../client/ui/pages/admin/backlogs/admin_backlog';
import '../../../client/ui/pages/admin/backlogs/admin_backlogs';
import '../../../client/ui/pages/admin/calculated_fields/integration_calculated_field';
import '../../../client/ui/pages/admin/calculated_fields/integration_calculated_fields';
import '../../../client/ui/pages/admin/contributor_roles/contributor_role_definitions';
import '../../../client/ui/pages/admin/display_templates/display_templates';
import '../../../client/ui/pages/admin/dynamic_collections/dynamic_collection';
import '../../../client/ui/pages/admin/dynamic_collections/dynamic_collections';
import '../../../client/ui/pages/admin/import_export/import_export';
import '../../../client/ui/pages/admin/integration_import_functions/integration_import_function';
import '../../../client/ui/pages/admin/integration_import_functions/integration_import_functions';
import '../../../client/ui/pages/admin/integration_servers/integration_servers';
import '../../../client/ui/pages/admin/integration_servers/integration_server';
import '../../../client/ui/pages/admin/projects/admin_projects';
import '../../../client/ui/pages/admin/projects/admin_project_integration';
import '../../../client/ui/pages/admin/releases/admin_release';
import '../../../client/ui/pages/admin/releases/admin_releases';
import '../../../client/ui/pages/admin/scheduled_jobs/scheduled_job';
import '../../../client/ui/pages/admin/scheduled_jobs/scheduled_jobs';
import '../../../client/ui/pages/admin/teams/admin_team';
import '../../../client/ui/pages/admin/teams/admin_teams';
import '../../../client/ui/pages/admin/users/admin_users';
import '../../../client/ui/pages/anonymous/release_plan/release_plan';
import '../../../client/ui/pages/capacity_plans/capacity_plan';
import '../../../client/ui/pages/capacity_plans/capacity_plans';
import '../../../client/ui/pages/capacity_plans/capacity_plan_report';
import '../../../client/ui/pages/capacity_plans/capacity_plan_summary_report';
import '../../../client/ui/pages/contributor/contributor_home';
import '../../../client/ui/pages/effort/effort';
import '../../../client/ui/pages/imported_item/imported_item_page';
import '../../../client/ui/pages/project/project_home';
import '../../../client/ui/pages/releases/releases';
import '../../../client/ui/pages/releases/release';
import '../../../client/ui/pages/report/report_container';
import '../../../client/ui/pages/report/support/weekly_support_report';
import '../../../client/ui/pages/status_report/status_report';
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
FlowRouter.route('/backlog/:backlogId', {
  name: 'Backlog',
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'Backlog' });
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
FlowRouter.route('/imported_item/:itemId', {
  name: 'ImportedItem',
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'ImportedItemPage' });
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
FlowRouter.route('/release/:releaseId', {
  name: 'Release',
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'Release' });
  }
});
FlowRouter.route('/releases', {
  name: 'Releases',
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'Releases' });
  }
});
FlowRouter.route('/status_report/:reportId', {
  name: 'StatusReport',
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'StatusReport' });
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

FlowRouter.route('/capacity_plans', {
  name: 'CapacityPlans',
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'CapacityPlans' });
  }
});

FlowRouter.route('/capacity_plan/:planId', {
  name: 'CapacityPlan',
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'CapacityPlan' });
  }
});

FlowRouter.route('/capacity_plan/:planId/:optionId', {
  name: 'CapacityPlanOption',
  action () {
    BlazeLayout.render('AuthenticatedLayout', { main: 'CapacityPlan' });
  }
});

FlowRouter.route('/capacity_plan_report/:planId', {
  name: 'CapacityPlanReport',
  action () {
    BlazeLayout.render('ReportLayout', { main: 'CapacityPlanReport' });
  }
});

FlowRouter.route('/capacity_plan_summary_report/:planId', {
  name: 'CapacityPlanSummaryReport',
  action () {
    BlazeLayout.render('ReportLayout', { main: 'CapacityPlanSummaryReport' });
  }
});

/**
 *
 * Anonymous Routes
 *
 */
FlowRouter.route('/release_plan', {
  name: 'ReleasePlan',
  action () {
    BlazeLayout.render('AnonymousLayout', { main: 'ReleasePlan' });
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
FlowRouter.route('/admin/backlogs', {
  name: 'AdminBacklogs',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'AdminBacklogs' });
  }
});
FlowRouter.route('/admin/backlog/:backlogId', {
  name: 'AdminBacklog',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'AdminBacklog' });
  }
});

FlowRouter.route('/admin/contributor/:contributorId', {
  name: 'AdminContributor',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'AdminContributor' });
  }
});

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

FlowRouter.route('/admin/integration_server/:serverId', {
  name: 'IntegrationServer',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'IntegrationServer' });
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

FlowRouter.route('/admin/display_template/:groupId/:templateName', {
  name: 'DisplayTemplateByName',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'DisplayTemplates' });
  }
});

FlowRouter.route('/admin/dynamic_collections', {
  name: 'DynamicCollections',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'DynamicCollections' });
  }
});

FlowRouter.route('/admin/dynamic_collection/:collectionId', {
  name: 'DynamicCollection',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'DynamicCollection' });
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

FlowRouter.route('/admin/releases', {
  name: 'AdminReleases',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'AdminReleases' });
  }
});

FlowRouter.route('/admin/release/:releaseId', {
  name: 'AdminRelease',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'AdminRelease' });
  }
});

FlowRouter.route('/admin/scheduled_jobs', {
  name: 'ScheduledJobs',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'ScheduledJobs' });
  }
});

FlowRouter.route('/admin/scheduled_job/:jobId', {
  name: 'ScheduledJob',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'ScheduledJob' });
  }
});

FlowRouter.route('/admin/teams', {
  name: 'AdminTeams',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'AdminTeams' });
  }
});

FlowRouter.route('/admin/team/:teamId', {
  name: 'AdminTeam',
  action () {
    BlazeLayout.render('AdminLayout', { main: 'AdminTeam' });
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