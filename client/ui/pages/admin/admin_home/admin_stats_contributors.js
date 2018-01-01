import './admin_stats_contributors.html';
import { Template } from 'meteor/templating';
import { Contributors } from '../../../../../imports/api/contributors/contributors';
import { ContributorRoleDefinitions } from '../../../../../imports/api/contributors/contributor_role_definitions';

/**
 * Template Helpers
 */
Template.AdminStatsContributors.helpers({
  contributorRolesContext () {
    let data = Contributors.find();
    return {
      cssClass: 'donut-flex',
      config  : {
        title    : 'Roles',
        attribute: 'roleId',
        renderLabel (roleId) {
          let roleDefinition = ContributorRoleDefinitions.findOne(roleId);
          return roleDefinition && roleDefinition.title
        }
      },
      data    : data.fetch()
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdminStatsContributors.events({});

/**
 * Template Created
 */
Template.AdminStatsContributors.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('contributors');
});

/**
 * Template Rendered
 */
Template.AdminStatsContributors.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminStatsContributors.onDestroyed(() => {
  
});
