import './add_role_form.html';
import { Template } from 'meteor/templating';
import { ContributorRoles } from '../../../../imports/api/contributors/contributor_roles';
import { Teams } from '../../../../imports/api/teams/teams';
import { Util } from '../../../../imports/api/util.js';

let roleSchema = new SimpleSchema({
  teamId: {
    type : String,
    label: "Team"
  },
  role  : {
    type         : Number,
    allowedValues: _.values(ContributorRoles),
    label        : "Role"
  }
});

/**
 * Template Helpers
 */
Template.AddRoleForm.helpers({
  getRoleSchema(){
    return roleSchema
  },
  teamOptions(){
    return Teams.find({}, {sort: {title: 1}})
  },
  roleOptions(){
    return _.keys(ContributorRoles).map((role) => {
      return { title: Util.camelToTitle(role), value: ContributorRoles[role] }
    })
  }
});

/**
 * Template Event Handlers
 */
Template.AddRoleForm.events({});

/**
 * Template Created
 */
Template.AddRoleForm.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AddRoleForm.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AddRoleForm.onDestroyed(() => {
  
});
