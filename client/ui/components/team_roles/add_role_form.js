import './add_role_form.html';
import { Template }                   from 'meteor/templating';
import { Random }                     from 'meteor/random';
import SimpleSchema                   from 'simpl-schema';
import { ContributorRoleDefinitions } from '../../../../imports/api/contributors/contributor_role_definitions.js';
import { Teams }                      from '../../../../imports/api/teams/teams';

let schema = new SimpleSchema({
  teamId: {
    type : String,
    label: 'Team'
  },
  roleId: {
    type : String,
    label: 'Role'
  }
});

/**
 * Template Helpers
 */
Template.AddRoleForm.helpers({
  getSchema () {
    return schema
  },
  teamOptions () {
    return Teams.find({}, { sort: { title: 1 } })
  },
  roleOptions () {
    return ContributorRoleDefinitions.find({}, { sort: { order: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.AddRoleForm.events({
  'submit form' (e, instance) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

/**
 * Template Created
 */
Template.AddRoleForm.onCreated(() => {
  let instance = Template.instance();
  
  instance.formId = Random.id();
});

/**
 * Template Rendered
 */
Template.AddRoleForm.onRendered(() => {
  let instance = Template.instance();
  
  // Set the value of the role selector to the default
  if (instance.data.contributor) {
    console.log('AddRoleForm setting default role:', instance.data.contributor.roleId);
    instance.$('select[name="roleId"]').val(instance.data.contributor.roleId);
  }
});

/**
 * Template Destroyed
 */
Template.AddRoleForm.onDestroyed(() => {
  
});
