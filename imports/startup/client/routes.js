import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import the base templates
import '../../../client/ui/layouts/unauthenticated_layout.js';
import '../../../client/ui/layouts/authenticated_layout.js';

// Import the pages
import '../../../client/ui/pages/admin/contributors/admin_contributors.js';
import '../../../client/ui/pages/admin/admin_home/admin_home.js';
import '../../../client/ui/pages/admin/integrations/integrations.js';
import '../../../client/ui/pages/admin/integrations/integration_import_function.js';
import '../../../client/ui/pages/admin/integrations/integration_server_browser.js';
import '../../../client/ui/pages/admin/projects/admin_projects.js';
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
  action() {
    BlazeLayout.render('UnauthenticatedLayout', { main: 'Login' });
  }
});

FlowRouter.route('/logout', {
  name: 'Logout',
  action() {
    Meteor.logout();
    setTimeout(() => {
      FlowRouter.go('/');
    }, 10);
  }
});

// Authenticated Routes
FlowRouter.route('/', {
  name: 'Home',
  action() {
    BlazeLayout.render('AuthenticatedLayout', { main: 'ContributorHome' });
  }
});
FlowRouter.route('/contributor/:contributorId', {
  name: 'ContributorHome',
  action() {
    BlazeLayout.render('AuthenticatedLayout', { main: 'ContributorHome' });
  }
});
FlowRouter.route('/effort/:effortId', {
  name: 'Effort',
  action() {
    BlazeLayout.render('AuthenticatedLayout', { main: 'Effort' });
  }
});
FlowRouter.route('/project/:projectId', {
  name: 'ProjectHome',
  action() {
    BlazeLayout.render('AuthenticatedLayout', { main: 'ProjectHome' });
  }
});
FlowRouter.route('/task/:taskId', {
  name: 'Task',
  action() {
    BlazeLayout.render('AuthenticatedLayout', { main: 'Task' });
  }
});
FlowRouter.route('/team/:teamId', {
  name: 'TeamHome',
  action() {
    BlazeLayout.render('AuthenticatedLayout', { main: 'TeamHome' });
  }
});

FlowRouter.route('/user_profile', {
  name: 'UserProfile',
  action() {
    BlazeLayout.render('AuthenticatedLayout', { main: 'UserProfile' });
  }
});

// Admin Routes
FlowRouter.route('/admin/contributors', {
  name: 'AdminContributors',
  action() {
    BlazeLayout.render('AdminLayout', { main: 'AdminContributors' });
  }
});

FlowRouter.route('/admin/home', {
  name: 'AdminHome',
  action() {
    BlazeLayout.render('AdminLayout', { main: 'AdminHome' });
  }
});

FlowRouter.route('/admin/integrations', {
  name: 'Integrations',
  action() {
    BlazeLayout.render('AdminLayout', { main: 'Integrations' });
  }
});

FlowRouter.route('/admin/integration_server_browser/:serverId', {
  name: 'IntegrationServerBrowser',
  action() {
    BlazeLayout.render('AdminLayout', { main: 'IntegrationServerBrowser' });
  }
});

FlowRouter.route('/admin/integration_import_function/:functionId', {
  name: 'IntegrationImportFunction',
  action() {
    BlazeLayout.render('AdminLayout', { main: 'IntegrationImportFunction' });
  }
});

FlowRouter.route('/admin/projects', {
  name: 'AdminProjects',
  action() {
    BlazeLayout.render('AdminLayout', { main: 'AdminProjects' });
  }
});

FlowRouter.route('/admin/project/:projectId', {
  name: 'AdminProjectHome',
  action() {
    BlazeLayout.render('AdminLayout', { main: 'AdminProjectHome' });
  }
});

FlowRouter.route('/admin/teams', {
  name: 'AdminTeams',
  action() {
    BlazeLayout.render('AdminLayout', { main: 'AdminTeams' });
  }
});

FlowRouter.route('/admin/users', {
  name: 'AdminUsers',
  action() {
    BlazeLayout.render('AdminLayout', { main: 'AdminUsers' });
  }
});

// Handle bad routes
FlowRouter.notFound = {
  action() {
    BlazeLayout.render('AuthenticatedLayout', { main: 'NotFound' });
  },
};