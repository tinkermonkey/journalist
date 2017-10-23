import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { AutoForm } from 'meteor/aldeed:autoform';
import { moment } from 'meteor/momentjs:moment';
import { Util } from '../../api/util.js';
import { Contributors } from '../../api/contributors/contributors.js';
import { ContributorRoles } from '../../api/contributors/contributor_roles.js';
import { Projects } from '../../api/projects/projects.js';
import { Teams } from '../../api/teams/teams';
import { Users } from '../../api/users/users';
import { UserTypes } from '../../api/users/user_types.js';

/**
 * Custom autoform hooks to prevent client side inserts
 */
AutoForm.hooks({
  serverMethodForm: {
    onSubmit(insertDoc, updateDoc, currentDoc){
      this.event.preventDefault();
      let dialogElement = $('#' + this.formId).closest('.roba-dialog'),
          dialogButton  = dialogElement.find('.button-bar button').last('button');
      dialogButton.trigger('click');
      return false;
    }
  },
  addRecordForm: {
    onSubmit(insertDoc, updateDoc, currentDoc){
      this.event.preventDefault();
      let dialogElement = $('#' + this.formId).closest('.roba-dialog'),
          dialogButton  = dialogElement.find('.button-bar button').last('button');
      dialogButton.trigger('click');
      return false;
    }
  }
});

/**
 * Enums
 */
Template.registerHelper('UserTypes', function () {
  return UserTypes
});
Template.registerHelper('ContributorRoles', function () {
  return ContributorRoles
});

/**
 * User helpers
 */
Template.registerHelper('userIsAdmin', function () {
  let user = Users.findOne(Meteor.userId());
  if (user) {
    return user.isAdmin();
  }
});
Template.registerHelper('userIsManager', function () {
  let user = Users.findOne(Meteor.userId());
  if (user) {
    return user.isManager();
  }
});
Template.registerHelper('userManagesContributor', function (contributorId) {
  let user      = Users.findOne(Meteor.userId());
  contributorId = contributorId || (this && this.contributorId);
  if (user) {
    return user.contributor().managesContributor(contributorId) || user.isAdmin();
  }
});
Template.registerHelper('userDirectReports', function () {
  let user = Users.findOne(Meteor.userId());
  if (user) {
    return user.directReports();
  }
});
Template.registerHelper('userName', function () {
  let user = Users.findOne(Meteor.userId());
  if (user && user.profile) {
    return user.profile.name;
  }
});
Template.registerHelper('renderUserType', function () {
  let usertype = (this && this.usertype) || this;
  if (usertype) {
    return Util.capitalize(_.invert(UserTypes)[ usertype ]);
  }
});
Template.registerHelper('renderTeamRole', function (role) {
  if (role !== null) {
    return Util.camelToTitle(_.invert(ContributorRoles)[ role ]);
  }
});
Template.registerHelper('managerSelectorContext', function () {
  let record = this;
  
  return {
    valueField  : '_id',
    displayField: 'name',
    value       : record.manager,
    dataKey     : 'manager',
    collection  : Contributors,
    emptyText   : 'Select a manager',
    query       : {
      usertype: { $in: [ UserTypes.manager, UserTypes.administrator ] }
    }
  }
});
Template.registerHelper('ownerSelectorContext', function () {
  let record = this;
  
  return {
    valueField  : '_id',
    displayField: 'name',
    value       : record.owner,
    dataKey     : 'owner',
    collection  : Contributors,
    emptyText   : 'Select an owner',
    query       : {
      usertype: { $in: [ UserTypes.manager, UserTypes.administrator ] }
    }
  }
});
Template.registerHelper('projectChecklistContext', function () {
  let record = this;
  
  return {
    valueField  : '_id',
    displayField: 'title',
    value       : record.projects,
    dataKey     : 'projects',
    collection  : Projects,
    emptyText   : 'Select projects',
    query       : {}
  }
});
Template.registerHelper('teamSelectorContext', function () {
  let record = this;
  
  return {
    valueField  : '_id',
    displayField: 'title',
    value       : record.teamId,
    dataKey     : 'teamId',
    collection  : Teams,
    emptyText   : 'Select team',
    cssClass    : 'inline-block',
    query       : {}
  }
});

/**
 * Simple pathFor helper
 */
Template.registerHelper('pathFor', function (routeName, routeParams) {
  return FlowRouter.path(routeName, routeParams.hash);
});

/**
 * Misc helpers
 */
Template.registerHelper('isNewRecord', function () {
  let record = this;
  if (record && record.dateCreated && _.isDate(record.dateCreated)) {
    let now = Date.now();
    // New = created in the last minute
    return (now - record.dateCreated) < (60 * 1000)
  }
  return false
});

Template.registerHelper('dateFormat', function (date, format) {
  format = _.isString(format) ? format : 'MMM Do, YY';
  if (date) {
    return moment(date).format(format);
  }
});
