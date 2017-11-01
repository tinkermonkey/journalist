import './team_header.html';
import { Template } from 'meteor/templating';
import { ContributorTeamRoles } from '../../../../imports/api/contributors/contributor_team_roles';
import './team_role_contributor_list';

/**
 * Template Helpers
 */
Template.TeamHeader.helpers({
  teamRoles(){
    let teamId = this._id;
    return _.uniq(ContributorTeamRoles.find({teamId: teamId}).map((teamRole) => { return teamRole.role })).sort()
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
