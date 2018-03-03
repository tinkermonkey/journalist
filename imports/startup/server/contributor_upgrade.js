// Map the fields that need to be transitioned from contributorId to userId
import { Efforts }                       from '../../api/efforts/efforts';
import { CapacityPlanSprintBlocks }      from '../../api/capacity_plans/capacity_plan_sprint_blocks';
import { CapacityPlanBlockTypes }        from '../../api/capacity_plans/capacity_plan_block_types';
import { ContributorProjectAssignments } from '../../api/contributors/contributor_project_assignments';
import { ContributorTeamRoles }          from '../../api/contributors/contributor_team_roles';

let upgradeCollections = [
  {
    collection: CapacityPlanSprintBlocks,
    query     : { blockType: CapacityPlanBlockTypes.contributor },
    fields    : {
      contributorId: {
        action: 'update'
      }
    }
  }, {
    collection: ContributorProjectAssignments,
    query     : {},
    fields    : {
      contributorId: {
        action: 'convert'
      }
    }
  }, {
    collection: ContributorTeamRoles,
    query     : {},
    fields    : {
      contributorId: {
        action: 'convert'
      }
    }
  }, {
    collection: Efforts,
    query     : {},
    fields    : {
      contributorId: {
        action: 'convert'
      }
    }
  }
];