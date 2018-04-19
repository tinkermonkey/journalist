import './release_plan_cell.html';
import { Template }                 from 'meteor/templating';
import { CapacityPlanBlockTypes }   from '../../../../../imports/api/capacity_plans/capacity_plan_block_types';
import { CapacityPlanReleases }     from '../../../../../imports/api/capacity_plans/capacity_plan_releases';
import { CapacityPlanSprintBlocks } from '../../../../../imports/api/capacity_plans/capacity_plan_sprint_blocks';
import { CapacityPlanSprintLinks }  from '../../../../../imports/api/capacity_plans/capacity_plan_sprint_links';
import './release_plan_effort';

/**
 * Template Helpers
 */
Template.ReleasePlanCell.helpers({
  efforts () {
    let sprint       = this.sprint,
        release      = this.release,
        effortBlocks = _.flatten(sprint.capacityPlanSprints.map((capacityPlanSprint) => {
          let capacityPlanReleaseIds = CapacityPlanReleases.find({ optionId: capacityPlanSprint.optionId, releaseId: release._id })
              .map((planRelease) => {
                return planRelease._id
              }),
              releaseBlockIds        = CapacityPlanSprintBlocks.find({
                    optionId: capacityPlanSprint.optionId,
                    dataId  : { $in: capacityPlanReleaseIds }
                  })
                  .map((releaseBlock) => {
                    return releaseBlock._id
                  }),
              effortIds              = _.uniq(CapacityPlanSprintLinks.find({
                    optionId: capacityPlanSprint.optionId,
                    targetId: { $in: releaseBlockIds }
                  })
                  .map((releaseLink) => {
                    let sourceBlock = releaseLink.source();
                    if (sourceBlock) {
                      return sourceBlock.dataId
                    }
                  }));
      
          //console.log('ReleasePlanCell.efforts:', release.title, sprint.sprintNumber, capacityPlanSprint.sprintNumber, capacityPlanReleaseIds, releaseBlockIds, effortIds);
      
          return CapacityPlanSprintBlocks.find({
            optionId    : capacityPlanSprint.optionId,
            dataId      : { $in: effortIds },
            sprintNumber: capacityPlanSprint.sprintNumber
          }).fetch();
        }));
    
    return effortBlocks.map((block) => {
      let data = block.dataRecord();
      
      // Determine the staffing levels
      data.staffing = {};
      block.children().fetch().filter((sprintBlock) => {
        return sprintBlock.blockType === CapacityPlanBlockTypes.contributor
      }).forEach((contributorBlock) => {
        let contributor = contributorBlock.dataRecord();
        
        if (contributor.roleId) {
          if (data.staffing[ contributor.roleId ]) {
            data.staffing[ contributor.roleId ].count += 1
          } else {
            data.staffing[ contributor.roleId ] = {
              definition: contributor.defaultRole().capacityRole(),
              count     : 1
            }
          }
        }
      });
      
      data.roles = _.values(data.staffing);
      
      return data
    }).sort((a, b) => {
      return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1
    })
  }
});

/**
 * Template Event Handlers
 */
Template.ReleasePlanCell.events({});

/**
 * Template Created
 */
Template.ReleasePlanCell.onCreated(() => {

});

/**
 * Template Rendered
 */
Template.ReleasePlanCell.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ReleasePlanCell.onDestroyed(() => {
  
});
