import { Meteor }                        from 'meteor/meteor';
import { Contributors }                  from '../contributors';
import { ContributorTeamRoles }          from '../contributor_team_roles';
import { ContributorRoleDefinitions }    from '../contributor_role_definitions';
import { ContributorProjectAssignments } from '../contributor_project_assignments';

Meteor.publish('contributors', function () {
  console.info('Publish: contributors');
  if (this.userId) {
    return Contributors.find({});
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('contributor_team_roles', function () {
  console.info('Publish: contributor_team_roles');
  if (this.userId) {
    return ContributorTeamRoles.find({});
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('contributor_project_assignments', function () {
  console.info('Publish: contributor_project_assignments');
  if (this.userId) {
    return ContributorProjectAssignments.find({});
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('contributor_role_definitions', function () {
  console.info('Publish: contributor_role_definitions');
  // TODO: Figure out a better way to control anonymous access
  return ContributorRoleDefinitions.find({});
});
