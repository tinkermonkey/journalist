import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import the base templates
import '../../../client/ui/layouts/unauthenticated_layout.js';
import '../../../client/ui/layouts/authenticated_layout.js';

// Import the pages
import '../../../client/ui/pages/admin/contributors/admin_contributors.js';
import '../../../client/ui/pages/admin/home/admin_home.js';
import '../../../client/ui/pages/admin/projects/admin_projects.js';
import '../../../client/ui/pages/admin/teams/admin_teams.js';
import '../../../client/ui/pages/admin/users/admin_users.js';

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
  name: 'SystemOverview',
  action() {
    BlazeLayout.render('AuthenticatedLayout', { main: 'SystemOverview' });
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

FlowRouter.route('/admin/projects', {
  name: 'AdminProjects',
  action() {
    BlazeLayout.render('AdminLayout', { main: 'AdminProjects' });
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