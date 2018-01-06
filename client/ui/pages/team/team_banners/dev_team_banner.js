import './dev_team_banner.html';
import { Template } from 'meteor/templating';
import { Projects } from '../../../../../imports/api/projects/projects';
import { ImportedItemCrumbs } from '../../../../../imports/api/imported_items/imported_item_crumbs';
import { ImportedItemWorkPhases } from '../../../../../imports/api/imported_items/imported_item_work_phases';
import { ContributorProjectAssignments } from '../../../../../imports/api/contributors/contributor_project_assignments';
import { ItemTypes } from '../../../../../imports/api/imported_items/item_types';
import { ContributorRoleDefinitions } from '../../../../../imports/api/contributors/contributor_role_definitions';
import { ContributorTeamRoles } from '../../../../../imports/api/contributors/contributor_team_roles';
import { Util } from '../../../../../imports/api/util';

/**
 * Template Helpers
 */
Template.DevTeamBanner.helpers({
  teamCapacityDonutContext () {
    let team = this,
        data = ContributorTeamRoles.find({ teamId: team._id }).map((teamRole) => {
          return {
            roleId: teamRole.roleId,
            value : ContributorProjectAssignments.find({
              teamRoleId: teamRole._id
            }).map((projectAssignment) => {
              return projectAssignment.percent || 0
            }).reduce((acc, value) => {
              return acc + value
            }, 0)
          }
        });
    
    return {
      cssClass: 'donut-flex',
      config  : {
        aggregation   : 'sum',
        keyAttribute  : 'roleId',
        valueAttribute: 'value',
        chart         : {
          donut: {
            title: { text: [ 'Capacity by role', '(People)' ], showTotal: true },
            label: {
              format (value, ratio, id) {
                return value && value / 100
              }
            }
          },
        },
        renderLabel (value) {
          let definition = ContributorRoleDefinitions.findOne(value);
          return definition && definition.title
        },
      },
      data    : data
    }
  },
  projectCapacityDonutContext () {
    let team = this,
        data = _.flatten(ContributorTeamRoles.find({ teamId: team._id }).map((teamRole) => {
          return ContributorProjectAssignments.find({
            teamRoleId: teamRole._id
          }).fetch();
        }));
    
    return {
      cssClass: 'donut-flex',
      config  : {
        aggregation   : 'sum',
        keyAttribute  : 'projectId',
        valueAttribute: 'percent',
        chart         : {
          donut: {
            title: { text: [ 'Capacity by project', '(People)' ], showTotal: true },
            label: {
              format (value, ratio, id) {
                return value && value / 100
              }
            }
          },
        },
        renderLabel (value) {
          let project = Projects.findOne(value);
          return project && project.title
        },
      },
      data    : data
    }
  },
  teamPlanningTicketTypes () {
    let team = this,
        data = ImportedItemCrumbs.find({
          teamId   : team._id,
          workPhase: ImportedItemWorkPhases.planning,
          itemType : { $in: [ ItemTypes.feature, ItemTypes.bug ] }
        }).fetch();
    
    return {
      cssClass: 'donut-flex',
      config  : {
        aggregation   : 'count',
        valueAttribute: 'itemType',
        chart         : {
          donut: {
            title: { text: [ 'Being planned', '(items)' ], showTotal: true },
            label: {
              format (value, ratio, id) {
                return value
              }
            }
          },
        },
        renderLabel (value) {
          return Util.camelToTitle(_.invert(ItemTypes)[ value ])
        },
      },
      data    : data
    }
  },
  teamImplementingTicketTypes () {
    let team = this,
        data = ImportedItemCrumbs.find({
          teamId   : team._id,
          workPhase: ImportedItemWorkPhases.implementation,
          itemType : { $in: [ ItemTypes.feature, ItemTypes.bug ] }
        }).fetch();
    
    return {
      cssClass: 'donut-flex',
      config  : {
        aggregation   : 'count',
        valueAttribute: 'itemType',
        chart         : {
          donut: {
            title: { text: [ 'Being implemented', '(items)' ], showTotal: true },
            label: {
              format (value, ratio, id) {
                return value
              }
            }
          },
        },
        renderLabel (value) {
          return Util.camelToTitle(_.invert(ItemTypes)[ value ])
        },
      },
      data    : data
    }
  },
  teamVerificationTicketTypes () {
    let team = this,
        data = ImportedItemCrumbs.find({
          teamId   : team._id,
          workPhase: ImportedItemWorkPhases.verification,
          itemType : { $in: [ ItemTypes.feature, ItemTypes.bug ] }
        }).fetch();
    
    return {
      cssClass: 'donut-flex',
      config  : {
        aggregation   : 'count',
        valueAttribute: 'itemType',
        chart         : {
          donut: {
            title: { text: [ 'Being verified', '(items)' ], showTotal: true },
            label: {
              format (value, ratio, id) {
                return value
              }
            }
          },
        },
        renderLabel (value) {
          return Util.camelToTitle(_.invert(ItemTypes)[ value ])
        },
      },
      data    : data
    }
  }
});

/**
 * Template Event Handlers
 */
Template.DevTeamBanner.events({});

/**
 * Template Created
 */
Template.DevTeamBanner.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let team = Template.currentData();
    
    instance.subscribe('imported_item_crumb_query', { teamId: team._id })
  });
});

/**
 * Template Rendered
 */
Template.DevTeamBanner.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.DevTeamBanner.onDestroyed(() => {
  
});
