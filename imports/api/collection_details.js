import { Efforts }      from './efforts/efforts';
import { Tasks }        from './tasks/tasks';
import { Teams }        from './teams/teams';
import { Projects }     from './projects/projects';
import { Contributors } from './contributors/contributors';

export const CollectionDetails = {
  Contributors: {
    collection: Contributors,
    title     : 'Contributor',
    routeName : 'ContributorHome',
    routeParam: 'contributorId'
  },
  Efforts     : {
    collection: Efforts,
    title     : 'Effort',
    routeName : 'Effort',
    routeParam: 'effortId'
  },
  Projects    : {
    collection: Projects,
    title     : 'Project',
    routeName : 'ProjectHome',
    routeParam: 'projectId'
  },
  Tasks       : {
    collection: Tasks,
    title     : 'Task',
    routeName : 'Task',
    routeParam: 'taskId'
  },
  Teams       : {
    collection: Teams,
    title     : 'Team',
    routeName : 'TeamHome',
    routeParam: 'teamId'
  }
};