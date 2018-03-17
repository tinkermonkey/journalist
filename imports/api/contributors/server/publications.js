import { Meteor }                        from 'meteor/meteor';
import { logger }                        from 'meteor/austinsand:journalist-logger';
import { Contributors }                  from '../contributors';
import { ContributorTeamRoles }          from '../contributor_team_roles';
import { ContributorRoleDefinitions }    from '../contributor_role_definitions';
import { ContributorProjectAssignments } from '../contributor_project_assignments';

Meteor.publish('contributors', function () {
  logger.info('Publish: contributors');
  if (this.userId) {
    return Contributors.find({});
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('contributor_team_roles', function () {
  logger.info('Publish: contributor_team_roles');
  if (this.userId) {
    return ContributorTeamRoles.find({});
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('contributor_project_assignments', function () {
  logger.info('Publish: contributor_project_assignments');
  if (this.userId) {
    return ContributorProjectAssignments.find({});
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('contributor_role_definitions', function () {
  logger.info('Publish: contributor_role_definitions');
  if (this.userId) {
    return ContributorRoleDefinitions.find({});
  } else {
    this.ready();
    return [];
  }
});
