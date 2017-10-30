import './team_header.html';
import { Template } from 'meteor/templating';
import { ContributorTeamRoles } from '../../../../imports/api/contributors/contributor_team_roles';
import { Teams } from '../../../../imports/api/teams/teams';

/**
 * Template Helpers
 */
Template.TeamHeader.helpers({
  teamRoles(){
    let teamId = this._id;
    return _.uniq(ContributorTeamRoles.find({teamId: teamId}).map((teamRole) => { return teamRole.role })).sort()
  },
  contributorsInRole(teamId, role){
    return Teams.findOne(teamId).contributorsInRole(role)
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
