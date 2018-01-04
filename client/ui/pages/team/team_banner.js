import './team_banner.html';
import { Template } from 'meteor/templating';
import { ContributorTeamRoles } from '../../../../imports/api/contributors/contributor_team_roles';
import { ContributorProjectAssignments } from '../../../../imports/api/contributors/contributor_project_assignments';
import { ContributorRoleDefinitions } from '../../../../imports/api/contributors/contributor_role_definitions';
import { ImportedItemCrumbs } from '../../../../imports/api/imported_items/imported_item_crumbs';
import { ImportedItemWorkPhases } from '../../../../imports/api/imported_items/imported_item_work_phases';
import { ItemTypes } from '../../../../imports/api/imported_items/item_types';
import { Projects } from '../../../../imports/api/projects/projects';
import '../../components/charts/donut_chart';
import { Util } from '../../../../imports/api/util';

/**
 * Template Helpers
 */
Template.TeamBanner.helpers({
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
            title: 'Role Capacity (People)',
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
            title: 'Project Capacity (People)',
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
        data = ImportedItemCrumbs.find({ teamId: team._id, workPhase: ImportedItemWorkPhases.planning }).fetch();
    
    return {
      cssClass: 'donut-flex',
      config  : {
        aggregation   : 'count',
        valueAttribute: 'itemType',
        chart         : {
          donut: {
            title: 'Planning',
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
        data = ImportedItemCrumbs.find({ teamId: team._id, workPhase: ImportedItemWorkPhases.implementation }).fetch();
    
    return {
      cssClass: 'donut-flex',
      config  : {
        aggregation   : 'count',
        valueAttribute: 'itemType',
        chart         : {
          donut: {
            title: 'Implementing',
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
        data = ImportedItemCrumbs.find({ teamId: team._id, workPhase: ImportedItemWorkPhases.verification }).fetch();
    
    return {
      cssClass: 'donut-flex',
      config  : {
        aggregation   : 'count',
        valueAttribute: 'itemType',
        chart         : {
          donut: {
            title: 'Verifying',
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
Template.TeamBanner.events({});

/**
 * Template Created
 */
Template.TeamBanner.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let team = Template.currentData();
    
    instance.subscribe('imported_item_crumb_query', { teamId: team._id })
  });
});

/**
 * Template Rendered
 */
Template.TeamBanner.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TeamBanner.onDestroyed(() => {
  
});
