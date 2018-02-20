import './admin_team.html';
import { Template }             from 'meteor/templating';
import { Teams }                from '../../../../../imports/api/teams/teams';
import { Contributors }         from '../../../../../imports/api/contributors/contributors';
import { UserTypes }            from '../../../../../imports/api/users/user_types';
import '../../../components/team_roles/editable_contributor_role';

/**
 * Template Helpers
 */
Template.AdminTeam.helpers({
  team () {
    let teamId = FlowRouter.getParam('teamId');
    return Teams.findOne(teamId)
  },
  reporterSelectorContext () {
    return {
      valueField  : '_id',
      displayField: 'name',
      value       : this.reportingContributorId,
      dataKey     : 'reportingContributorId',
      collection  : Contributors,
      emptyText   : 'Select a default reporter',
      cssClass    : 'inline-block',
      query       : {
        usertype: { $in: [ UserTypes.manager, UserTypes.administrator ] }
      }
    }
  },
  contributorOtherTeams () {
    let teamId      = FlowRouter.getParam('teamId'),
        contributor = this,
        teamIds     = _.uniq(contributor.teamRoles().fetch().filter((teamRole) => {
          return teamRole.teamId !== teamId
        }).map((teamRole) => {
          return teamRole.teamId
        }));
    
    console.log('contributorOtherTeams:', teamId, contributor._id, contributor.name, teamIds);
    
    return Teams.find({ _id: { $in: teamIds } })
  }
});

/**
 * Template Event Handlers
 */
Template.AdminTeam.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let teamId  = $(e.target).closest('.team-container').attr('data-pk'),
        dataKey = $(e.target).attr('data-key');
    
    if (teamId && dataKey) {
      Meteor.call('editTeam', teamId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.AdminTeam.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminTeam.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminTeam.onDestroyed(() => {
  
});
