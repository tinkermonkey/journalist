import { Meteor } from 'meteor/meteor';
import { Contributors } from '../contributors';
import { ContributorTeamRoles } from '../contributor_team_roles';

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
