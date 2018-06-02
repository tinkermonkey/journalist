import './admin_stats_contributors.html';
import { Template }                   from 'meteor/templating';
import { Contributors }               from '../../../../../imports/api/contributors/contributors';
import { ContributorRoleDefinitions } from '../../../../../imports/api/contributors/contributor_role_definitions';
import { UserTypes }                  from '../../../../../imports/api/users/user_types';
import { Util }                       from '../../../../../imports/api/util';

/**
 * Template Helpers
 */
Template.AdminStatsContributors.helpers({
  contributorRolesContext () {
    let instance = Template.instance(),
        data     = Contributors.find({ isActive: true, roleId: { $exists: true } });
    return {
      cssClass: 'chart-flex',
      config  : {
        scaleVar      : instance.scaleVar,
        valueAttribute: 'roleId',
        callouts      : {
          show : true,
          align: false
        },
        chart         : {
          donut : {
            title: { text: [ 'Contributor', 'Roles' ], showTotal: true, totalType: 'unique' },
            label: {
              format (value, ratio, id) {
                return value
              }
            }
          },
          legend: {
            show: false
          }
        },
        countNull     : true,
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
    let instance = Template.instance(),
        data     = Contributors.find({ isActive: true, roleId: { $exists: true } });
    return {
      cssClass: 'chart-flex',
      config  : {
        scaleVar      : instance.scaleVar,
        valueAttribute: 'usertype',
        callouts      : {
          show : true,
          align: false
        },
        chart         : {
          donut : {
            title: { text: [ 'Contributor', 'Types' ], showTotal: true, totalType: 'unique' },
            label: {
              format (value, ratio, id) {
                return value
              }
            }
          },
          legend: {
            show: false
          }
        },
        renderLabel (value) {
          return Util.camelToTitle(_.invert(UserTypes)[ value ])
        }
      },
      data    : data.fetch()
    }
  },
  contributorIsActiveContext () {
    let instance = Template.instance(),
        data     = Contributors.find();
    return {
      cssClass: 'chart-flex',
      config  : {
        scaleVar      : instance.scaleVar,
        valueAttribute: 'isActive',
        callouts      : {
          show : true,
          align: false
        },
        chart         : {
          donut : {
            title: { text: [ 'Contributors', 'Records' ], showTotal: true },
            label: {
              format (value, ratio, id) {
                return value
              }
            }
          },
          legend: {
            show: false
          }
        },
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
  
  instance.scaleVar = new ReactiveVar();
  
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
