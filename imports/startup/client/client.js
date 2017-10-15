import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Users } from '../../api/users/users';

/**
 * User helpers
 */
Template.registerHelper('userIsAdmin', () => {
  let user = Users.findOne(Meteor.userId());
  if (user) {
    return user.isAdmin();
  }
});
Template.registerHelper('userIsManager', () => {
  let user = Users.findOne(Meteor.userId());
  if (user) {
    return user.isManager();
  }
});
Template.registerHelper('userDirectReports', () => {
  let user = Users.findOne(Meteor.userId());
  if (user) {
    return user.directReports();
  }
});
Template.registerHelper('userName', () => {
  let user = Users.findOne(Meteor.userId());
  if (user && user.profile) {
    return user.profile.name;
  }
});

/**
 * Simple pathFor helper
 */
Template.registerHelper('pathFor', function (routeName, routeParams) {
  return FlowRouter.path(routeName, routeParams.hash);
});
