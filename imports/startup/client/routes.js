import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';

// Import the base templates
import '../../../client/ui/layouts/unauthenticated_layout.js';
import '../../../client/ui/layouts/authenticated_layout.js';

// Import the pages

// Set the layout root element
BlazeLayout.setRoot('body');

// Routes
FlowRouter.route('/', {
  name: 'SystemOverview',
  action() {
    BlazeLayout.render('AuthenticatedLayout', { main: 'SystemOverview' });
  }
});

// Handle bad routes
FlowRouter.notFound = {
  action() {
    BlazeLayout.render('AuthenticatedLayout', { main: 'NotFound' });
  },
};