import './dev_project_banner.html';
import { Template } from 'meteor/templating';
import { ContributorProjectAssignments } from '../../../../../imports/api/contributors/contributor_project_assignments';
import { ContributorRoleDefinitions } from '../../../../../imports/api/contributors/contributor_role_definitions';
import { ContributorTeamRoles } from '../../../../../imports/api/contributors/contributor_team_roles';
import { ImportedItemCrumbs } from '../../../../../imports/api/imported_items/imported_item_crumbs';
import { ImportedItemWorkPhases } from '../../../../../imports/api/imported_items/imported_item_work_phases';
import { ItemTypes } from '../../../../../imports/api/imported_items/item_types';
import { Projects } from '../../../../../imports/api/projects/projects';
import { Util } from '../../../../../imports/api/util';
import '../../../components/charts/donut_chart';
import '../../../components/charts/dashboard_metric';

/**
 * Template Helpers
 */
Template.DevProjectBanner.helpers({
  reportableRoles () {
    let project = this;
    
    return _.uniq(ContributorProjectAssignments.find({ projectId: project._id })
        .map((projectAssignment) => {
          return projectAssignment.teamRole()
        })
        .filter((teamRole) => {
          return teamRole.roleDefinition().countForCapacity()
        })
        .map((teamRole) => {
          return teamRole.roleDefinition().capacityRole()._id
        }))
  },
  projectCapacityDonutContext () {
    console.log('projectCapacityDonutContext');
    let project = this,
        data    = ContributorProjectAssignments.find({ projectId: project._id })
            .filter((projectAssignment) => {
              return projectAssignment.teamRole().roleDefinition().countForCapacity()
            })
            .map((projectAssignment) => {
              return {
                roleId: projectAssignment.teamRole().roleDefinition().capacityRole()._id,
                value : projectAssignment.percent
              }
            });
    
    console.log('projectCapacityDonutContext:', data);
    
    return {
      cssClass: 'donut-flex',
      config  : {
        aggregation   : 'sum',
        keyAttribute  : 'roleId',
        valueAttribute: 'value',
        chart         : {
          donut : {
            title: { text: [ 'Capacity by role', '(People)' ], showTotal: true },
            label: {
              format (value, ratio, id) {
                return value && value / 100
              }
            }
          },
          legend: {
            show: false
          }
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
    return {};
    let project = this,
        data    = _.flatten(ContributorTeamRoles.find({ teamId: team._id })
            .fetch()
            .filter((teamRole) => {
              return teamRole.roleDefinition().countForCapacity()
            })
            .map((teamRole) => {
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
          donut : {
            title: { text: [ 'Capacity by project', '(People)' ], showTotal: true },
            label: {
              format (value, ratio, id) {
                return value && value / 100
              }
            }
          },
          legend: {
            show: false
          }
        },
        renderLabel (value) {
          let project = Projects.findOne(value);
          return project && project.title
        },
      },
      data    : data
    }
  },
  roleCapacityDonutContext (roleId, team) {
    return {};
    let data           = _.flatten(ContributorTeamRoles.find({ teamId: team._id })
        .fetch()
        .filter((teamRole) => {
          return teamRole.roleDefinition().capacityRole()._id === roleId
        })
        .map((teamRole) => {
          return ContributorProjectAssignments.find({
            teamRoleId: teamRole._id
          }).fetch();
        })),
        roleDefinition = ContributorRoleDefinitions.findOne(roleId);
    
    return {
      cssClass: 'donut-flex',
      config  : {
        aggregation   : 'sum',
        keyAttribute  : 'projectId',
        valueAttribute: 'percent',
        chart         : {
          donut : {
            title: { text: [ roleDefinition.title, 'Capacity', 'by project' ], showTotal: true },
            label: {
              format (value, ratio, id) {
                return value && value / 100
              }
            }
          },
          legend: {
            show: false
          }
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
    return {};
    let project = this,
        data    = ImportedItemCrumbs.find({
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
          donut : {
            title: { text: [ 'Being planned' ], showTotal: true },
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
          return Util.camelToTitle(_.invert(ItemTypes)[ value ])
        },
      },
      data    : data
    }
  },
  teamImplementingTicketTypes () {
    return {};
    let project = this,
        data    = ImportedItemCrumbs.find({
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
          donut : {
            title: { text: [ 'Being implemented' ], showTotal: true },
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
          return Util.camelToTitle(_.invert(ItemTypes)[ value ])
        },
      },
      data    : data
    }
  },
  teamVerificationTicketTypes () {
    return {};
    let project = this,
        data    = ImportedItemCrumbs.find({
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
          donut : {
            title: { text: [ 'Being verified' ], showTotal: true },
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
          return Util.camelToTitle(_.invert(ItemTypes)[ value ])
        },
      },
      data    : data
    }
  },
  devQaBalanceContext () {
    return {};
    let project        = this,
        devRole        = ContributorRoleDefinitions.findOne({ title: { $regex: 'developer', $options: 'i' } }),
        qaRole         = ContributorRoleDefinitions.findOne({ title: { $regex: 'qa engineer', $options: 'i' } }),
        devAssignments = ContributorTeamRoles.find({ teamId: team._id })
            .fetch()
            .filter((teamRole) => {
              return teamRole.roleDefinition().capacityRole()._id === devRole._id
            })
            .map((teamRole) => {
              return {
                roleId: teamRole.roleDefinition().capacityRole()._id,
                value : ContributorProjectAssignments.find({
                  teamRoleId: teamRole._id
                }).map((projectAssignment) => {
                  return projectAssignment.percent || 0
                }).reduce((acc, value) => {
                  return acc + value
                }, 0)
              }
            }),
        qaAssignments  = ContributorTeamRoles.find({ teamId: team._id })
            .fetch()
            .filter((teamRole) => {
              return teamRole.roleDefinition().capacityRole()._id === qaRole._id
            })
            .map((teamRole) => {
              return {
                roleId: teamRole.roleDefinition().capacityRole()._id,
                value : ContributorProjectAssignments.find({
                  teamRoleId: teamRole._id
                }).map((projectAssignment) => {
                  return projectAssignment.percent || 0
                }).reduce((acc, value) => {
                  return acc + value
                }, 0)
              }
            }),
        devCapacity    = devAssignments.reduce((acc, assignment) => {
          return acc + assignment.value
        }, 0),
        qaCapacity     = qaAssignments.reduce((acc, assignment) => {
          return acc + assignment.value
        }, 0),
        commonFactor   = Util.greatestCommonDivisor(devCapacity, qaCapacity);
    
    return {
      value   : (devCapacity / commonFactor).toString() + ':' + (qaCapacity / commonFactor).toString(),
      title   : 'Dev:QA Ratio',
      subTitle: 'Developers per QA'
    }
  }
});

/**
 * Template Event Handlers
 */
Template.DevProjectBanner.events({});

/**
 * Template Created
 */
Template.DevProjectBanner.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let project = Template.currentData();
    
    instance.subscribe('imported_item_crumb_query', { projectId: project._id })
  });
});

/**
 * Template Rendered
 */
Template.DevProjectBanner.onRendered(() => {

});

/**
 * Template Destroyed
 */
Template.DevProjectBanner.onDestroyed(() => {

});
