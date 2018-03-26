import './team_roster.html';
import { Template }                   from 'meteor/templating';
import { ContributorTeamRoles }       from '../../../../imports/api/contributors/contributor_team_roles';
import { ContributorRoleDefinitions } from '../../../../imports/api/contributors/contributor_role_definitions';
import './team_role_contributor_list';

/**
 * Template Helpers
 */
Template.TeamRoster.helpers({
  teamRoles () {
    let teamId               = this._id,
        roleDefinitionIdList = _.uniq(ContributorTeamRoles.find({ teamId: teamId }).map((teamRole) => {
          return teamRole.roleId
        }));
    return ContributorRoleDefinitions.find({ _id: { $in: roleDefinitionIdList } }, { sort: { order: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.TeamRoster.events({});

/**
 * Template Created
 */
Template.TeamRoster.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.TeamRoster.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TeamRoster.onDestroyed(() => {
  
});
