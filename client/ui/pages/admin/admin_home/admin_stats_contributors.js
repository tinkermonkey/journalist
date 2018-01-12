import './admin_stats_contributors.html';
import { Template } from 'meteor/templating';
import { Contributors } from '../../../../../imports/api/contributors/contributors';
import { ContributorRoleDefinitions } from '../../../../../imports/api/contributors/contributor_role_definitions';
import { UserTypes } from '../../../../../imports/api/users/user_types';
import { Util } from '../../../../../imports/api/util';

/**
 * Template Helpers
 */
Template.AdminStatsContributors.helpers({
  contributorRolesContext () {
    let data = Contributors.find();
    return {
      cssClass: 'chart-flex',
      config  : {
        title: { text: [ 'Contributor Roles' ], showTotal: true },
        countNull: true,
        valueAttribute: 'roleId',
        renderLabel (value) {
          if (value !== 'null') {
            let roleDefinition = ContributorRoleDefinitions.findOne(value);
            return roleDefinition && roleDefinition.title
          } else {
            return 'Unassigned'
          }
        }
      },
      data    : data.fetch()
    }
  },
  contributorTypeContext () {
    let data = Contributors.find();
    return {
      cssClass: 'chart-flex',
      config  : {
        title: { text: [ 'Contributor Types' ], showTotal: true },
        valueAttribute: 'usertype',
        renderLabel (value) {
          return Util.camelToTitle(_.invert(UserTypes)[ value ])
        }
      },
      data    : data.fetch()
    }
  },
  contributorIsActiveContext () {
    let data = Contributors.find();
    return {
      cssClass: 'chart-flex',
      config  : {
        title: { text: [ 'Contributors Active' ], showTotal: true },
        valueAttribute: 'isActive',
        renderLabel (value) {
          return value ? 'Yes' : 'No'
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
