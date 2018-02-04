import './team_header.html';
import { Template }                   from 'meteor/templating';
import { ContributorTeamRoles }       from '../../../../imports/api/contributors/contributor_team_roles';
import { ContributorRoleDefinitions } from '../../../../imports/api/contributors/contributor_role_definitions';
import './team_role_contributor_list';

/**
 * Template Helpers
 */
Template.TeamHeader.helpers({
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
Template.TeamHeader.events({});

/**
 * Template Created
 */
Template.TeamHeader.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.TeamHeader.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TeamHeader.onDestroyed(() => {
  
});
