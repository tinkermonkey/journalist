import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { AutoForm } from 'meteor/aldeed:autoform';
import { moment } from 'meteor/momentjs:moment';
import { Util } from '../../api/util.js';
import { Contributors } from '../../api/contributors/contributors.js';
import { ContributorRoleDefinitions } from '../../api/contributors/contributor_role_definitions';
import { IntegrationCalculatedFields } from '../../api/integrations/integration_calculated_fields.js';
import { DisplayTemplates } from '../../api/display_templates/display_templates.js';
import { DisplayTemplateGroups } from '../../api/display_templates/display_template_groups.js';
import { DisplayTemplateTypes } from '../../api/display_templates/display_template_types';
import { IntegrationImportFunctions } from '../../api/integrations/integration_import_functions.js';
import { IntegrationServers } from '../../api/integrations/integration_servers';
import { IntegrationTypes } from '../../api/integrations/integration_types.js';
import { ItemTypes } from '../../api/imported_items/item_types.js';
import { Projects } from '../../api/projects/projects.js';
import { Teams } from '../../api/teams/teams';
import { Users } from '../../api/users/users';
import { UserTypes } from '../../api/users/user_types.js';
import '../../../node_modules/c3/c3.css';

/**
 * Custom autoform hooks to prevent client side inserts
 */
AutoForm.hooks({
  serverMethodForm: {
    onSubmit (insertDoc, updateDoc, currentDoc) {
      this.event.preventDefault();
      let dialogElement = $('#' + this.formId).closest('.roba-dialog'),
          dialogButton  = dialogElement.find('.button-bar button').last('button');
      dialogButton.trigger('click');
      return false;
    }
  },
  addRecordForm   : {
    onSubmit (insertDoc, updateDoc, currentDoc) {
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

Template.registerHelper('DisplayTemplateTypes', function () {
  return DisplayTemplateTypes
});
Template.registerHelper('ItemTypes', function () {
  return ItemTypes
});
Template.registerHelper('IntegrationTypes', function () {
  return IntegrationTypes
});
Template.registerHelper('UserTypes', function () {
  return UserTypes
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
Template.registerHelper('isCurrentContributor', function (contributorId) {
  let user = Users.findOne(Meteor.userId());
  if (user) {
    return user.contributor()._id === contributorId;
  }
});
Template.registerHelper('userManagesContributor', function (contributorId) {
  let user      = Users.findOne(Meteor.userId());
  contributorId = contributorId || (this && this.contributorId);
  if (user && contributorId) {
    return user.contributor().managesContributor(contributorId) || user.isAdmin();
  }
});
Template.registerHelper('userManagesTeam', function (teamId) {
  let user = Users.findOne(Meteor.userId());
  teamId   = teamId || (this && this.teamId);
  if (user && teamId) {
    return user.contributor().managesTeam(teamId) || user.isAdmin();
  }
});
Template.registerHelper('userDirectStaff', function () {
  let user = Users.findOne(Meteor.userId());
  if (user) {
    return user.directStaff();
  }
});
Template.registerHelper('userName', function () {
  let user = Users.findOne(Meteor.userId());
  if (user && user.profile) {
    return user.profile.name;
  }
});
Template.registerHelper('contributorName', function (contributorId) {
  let contributor = Contributors.findOne(contributorId);
  if (contributor) {
    return contributor.name;
  }
});
Template.registerHelper('renderJson', function (data) {
  if (data) {
    return JSON.stringify(data, null, '\t')
  }
});
Template.registerHelper('camelToTitle', function (value) {
  if (value) {
    return Util.camelToTitle(value);
  }
});
Template.registerHelper('renderUserType', function () {
  let usertype = (this && this.usertype) || this;
  if (usertype !== null) {
    return Util.capitalize(_.invert(UserTypes)[ usertype ]);
  }
});
Template.registerHelper('renderTeamRole', function (roleId) {
  if (roleId !== null) {
    let definition = ContributorRoleDefinitions.findOne(roleId);
    if (definition) {
      return definition.title;
    } else {
      return 'Unknown'
    }
  }
});
Template.registerHelper('renderIntegrationType', function (type) {
  if (type !== null) {
    return Util.capitalize(_.invert(IntegrationTypes)[ type ]);
  }
});
Template.registerHelper('contributorSelectorContext', function (params) {
  let record  = this,
      context = {
        valueField  : '_id',
        displayField: 'name',
        value       : record.contributorId,
        dataKey     : 'contributorId',
        collection  : Contributors,
        emptyText   : 'Select a contributor',
        cssClass    : 'inline-block',
        mode        : 'popup',
        query       : {}
      };
  
  if (params && params.hash) {
    _.extend(context, params.hash);
  }
  
  return context
});
Template.registerHelper('managerSelectorContext', function (params) {
  let record  = this,
      context = {
        valueField  : '_id',
        displayField: 'name',
        value       : record.managerId,
        dataKey     : 'managerId',
        collection  : Contributors,
        emptyText   : 'Select a manager',
        cssClass    : 'inline-block',
        mode        : 'popup',
        query       : {
          usertype: { $in: [ UserTypes.manager, UserTypes.administrator ] }
        }
      };
  
  if (params && params.hash) {
    _.extend(context, params.hash);
  }
  
  return context
});
Template.registerHelper('ownerSelectorContext', function (params) {
  let record  = this,
      context = {
        valueField  : '_id',
        displayField: 'name',
        value       : record.owner,
        dataKey     : 'owner',
        collection  : Contributors,
        emptyText   : 'Select an owner',
        cssClass    : 'inline-block',
        mode        : 'popup',
        query       : {
          usertype: { $in: [ UserTypes.manager, UserTypes.administrator ] }
        }
      };
  
  if (params && params.hash) {
    _.extend(context, params.hash);
  }
  
  return context
});
Template.registerHelper('teamSelectorContext', function (params) {
  let record  = this,
      context = {
        valueField  : '_id',
        displayField: 'title',
        value       : record.teamId,
        dataKey     : 'teamId',
        collection  : Teams,
        emptyText   : 'Select team',
        cssClass    : 'inline-block',
        mode        : 'popup',
        query       : {}
      };
  
  if (params && params.hash) {
    _.extend(context, params.hash);
  }
  
  return context
});
Template.registerHelper('roleSelectorContext', function (params) {
  let record  = this,
      context = {
        valueField  : '_id',
        displayField: 'title',
        value       : record.roleId,
        dataKey     : 'roleId',
        collection  : ContributorRoleDefinitions,
        emptyText   : 'Select role',
        cssClass    : 'inline-block',
        mode        : 'popup',
        sort        : { sort: { order: 1 } },
        query       : {}
      };
  
  if (params && params.hash) {
    _.extend(context, params.hash);
  }
  
  return context
});
Template.registerHelper('projectSelectorContext', function (params) {
  let record  = this,
      context = {
        valueField  : '_id',
        displayField: 'title',
        value       : record.projectId,
        dataKey     : 'projectId',
        collection  : Projects,
        emptyText   : 'Select project',
        cssClass    : 'inline-block',
        mode        : 'popup',
        query       : {}
      };
  
  if (params && params.hash) {
    _.extend(context, params.hash);
  }
  
  return context
});
Template.registerHelper('serverSelectorContext', function (params) {
  let record  = this,
      context = {
        valueField  : '_id',
        displayField: 'title',
        value       : record.serverId,
        dataKey     : 'serverId',
        collection  : IntegrationServers,
        emptyText   : 'Select server',
        cssClass    : 'inline-block',
        mode        : 'popup',
        query       : {}
      };
  
  if (params && params.hash) {
    _.extend(context, params.hash);
  }
  
  return context
});
Template.registerHelper('importFunctionSelectorContext', function (params) {
  let record  = this,
      context = {
        valueField  : '_id',
        displayField: 'title',
        value       : record.importFunctionId,
        dataKey     : 'importFunctionId',
        collection  : IntegrationImportFunctions,
        emptyText   : 'Select import function',
        cssClass    : 'inline-block',
        mode        : 'popup',
        query       : {}
      };
  
  if (params && params.hash) {
    _.extend(context, params.hash);
  }
  
  return context
});
Template.registerHelper('calculatedFieldsChecklistContext', function (params) {
  let record  = this,
      context = {
        valueField  : '_id',
        displayField: 'title',
        value       : record.calculatedFieldIds,
        dataKey     : 'calculatedFieldIds',
        collection  : IntegrationCalculatedFields,
        emptyText   : 'Select calculated fields',
        cssClass    : 'inline-block',
        query       : {}
      };
  
  if (params && params.hash) {
    _.extend(context, params.hash);
  }
  
  return context
});
Template.registerHelper('displayTemplateSelectorContext', function (params) {
  let record  = this,
      context = {
        valueField  : 'templateName',
        displayField: 'templateName',
        value       : record.displayTemplate,
        dataKey     : 'displayTemplate',
        collection  : DisplayTemplates,
        emptyText   : 'Select display template',
        cssClass    : 'inline-block',
        mode        : 'popup',
        query       : {}
      };
  
  if (params && params.hash) {
    _.extend(context, params.hash);
    
    if (params.hash.templateType && !params.hash.query) {
      context.query = { templateType: params.hash.templateType }
    }
  }
  
  return context
});
Template.registerHelper('displayTemplateGroupSelectorContext', function (params) {
  let record  = this,
      context = {
        valueField  : '_id',
        displayField: 'title',
        value       : record.parentGroup,
        dataKey     : 'parentGroup',
        collection  : DisplayTemplateGroups,
        emptyText   : 'Select a template group',
        cssClass    : 'inline-block',
        mode        : 'popup',
        query       : {}
      };
  
  if (params && params.hash) {
    _.extend(context, params.hash);
  }
  
  return context
});

/**
 * Simple pathFor helper
 */
Template.registerHelper('pathFor', function (routeName, routeParams, queryParams) {
  if (routeName) {
    return FlowRouter.path(routeName, (routeParams || {}).hash, (queryParams || {}).hash);
  } else {
    console.error('pathFor given no route name:', arguments);
  }
});

/**
 * Return or generate a unique ID for an element tied to a Template Instance
 */
Template.registerHelper('getElementId', function () {
  let instance = Template.instance();
  if (!instance.elementId) {
    instance.elementId = 'Element_' + Random.id();
    if (instance.elementIdReactor) {
      instance.elementIdReactor.set(instance.elementId);
    }
  }
  return instance.elementId;
});

/**
 * Misc helpers
 */
Template.registerHelper('setPageTitle', function () {
  let title = [ ...arguments ].filter((s) => {
    return _.isString(s)
  }).join(' ');
  if (_.isString(title) && title.length) {
    window.document.title = title;
  }
});
Template.registerHelper('isNewRecord', function () {
  let record = this;
  if (record && record.dateCreated && _.isDate(record.dateCreated)) {
    let now = Date.now();
    // New = created in the last minute
    return (now - record.dateCreated) < (60 * 1000)
  }
  return false
});

Template.registerHelper('isOdd', function (index) {
  return index % 2 !== 0
});

Template.registerHelper('dateFormat', function (date, format) {
  format = _.isString(format) ? format : 'MMM Do, YYYY';
  if (date) {
    return moment(date).format(format);
  }
});

Template.registerHelper('fromNow', function (date) {
  if (date) {
    return moment.duration(date - Date.now(), 'ms').humanize(true);
  }
});

Template.registerHelper('daysOld', function (date) {
  if (date) {
    return moment().diff(moment(date), 'days')
  }
});
