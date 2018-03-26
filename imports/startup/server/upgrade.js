/**
 * Schema upgrade scripts that will fix data model changes
 */
import { Clustering }               from 'meteor/austinsand:journalist-clustering';
import { CapacityPlans }            from '../../api/capacity_plans/capacity_plans';
import { CapacityPlanOptions }      from '../../api/capacity_plans/capacity_plan_options';
import { CapacityPlanReleases }     from '../../api/capacity_plans/capacity_plan_releases';
import { Releases }                 from '../../api/releases/releases';
import { CapacityPlanSprintBlocks } from '../../api/capacity_plans/capacity_plan_sprint_blocks';
import { CapacityPlanBlockTypes }   from '../../api/capacity_plans/capacity_plan_block_types';

// Only run on the cluster master node
if (Clustering.isMaster()) {
  /**
   * Moving releases to a separate collection and keeping the CapacityPlanReleases collection as a link collection
   */
  if (CapacityPlanReleases.find({ title: { $exists: true } }).count()) {
    console.log("UPGRADE: Creating Releases for legacy CapacityPlanReleases");
    
    // Convert all of the existing records
    CapacityPlanReleases.find({ title: { $exists: true } }).forEach((planRelease) => {
      console.log("UPGRADE: Checking for release for plan release:", planRelease._id, planRelease.title);
      
      let release = Releases.findOne({ title: planRelease.title }),
          option  = CapacityPlanOptions.findOne({
            $or: [
              { planId: planRelease.planId },
              { _id: planRelease.optionId }
            ]
          });
      
      // Create a release if one doesn't already exist
      if (option) {
        if (release && release.title) {
          console.log("UPGRADE: Found an existing release for plan release:", planRelease._id, planRelease.title, release._id, release.title);
          CapacityPlanReleases.update(planRelease._id, {
            $set  : { releaseId: release._id, optionId: option._id },
            $unset: { title: "", planId: "" }
          });
        } else {
          console.log("UPGRADE: No release found for plan release:", planRelease._id, planRelease.title);
          let releaseId = Releases.insert({
            title       : planRelease.title,
            createdBy   : planRelease.createdBy,
            dateCreated : planRelease.dateCreated,
            modifiedBy  : planRelease.modifiedBy,
            dateModified: planRelease.dateModified
          });
          CapacityPlanReleases.update(planRelease._id, {
            $set  : { releaseId: releaseId, optionId: option._id },
            $unset: { title: "", planId: "" }
          });
        }
      }
    });
    
    // Cleanup all of the options
    CapacityPlanOptions.find().forEach((option) => {
      console.log("UPGRADE: Checking option for orphaned release blocks:", option._id, option.title);
      
      CapacityPlanSprintBlocks.find({
        optionId : option._id,
        blockType: CapacityPlanBlockTypes.release
      }).forEach((releaseBlock) => {
        let releaseRecord = releaseBlock.dataRecord();
        if (releaseRecord.optionId !== option._id) {
          console.log("UPGRADE: found an orphaned release block:", option._id, option.title, releaseRecord._id);
          let correctRelease = CapacityPlanReleases.findOne({ optionId: option._id, releaseId: releaseRecord.releaseId });
          if (correctRelease) {
            console.log("UPGRADE: linking orphaned release block to correct release:", option._id, option.title, correctRelease._id);
            CapacityPlanSprintBlocks.update(releaseBlock._id, { $set: { dataId: correctRelease._id } })
          } else {
            console.log("UPGRADE: creating release for orphaned release block:", option._id, option.title);
            let planReleaseId = CapacityPlanReleases.insert({
              optionId    : option._id,
              releaseId   : releaseRecord.releaseId,
              createdBy   : releaseRecord.createdBy,
              dateCreated : releaseRecord.dateCreated,
              modifiedBy  : releaseRecord.modifiedBy,
              dateModified: releaseRecord.dateModified
            });
            CapacityPlanSprintBlocks.update(releaseBlock._id, { $set: { dataId: planReleaseId } })
          }
        }
      });
    });
  }
  
  /**
   * Start date was moved from CapacityPlanOption to CapacityPlan on 3/11/2018
   *
   * https://github.com/austinsand/journalist/commit/2977d1380338671930034c4d11d645fd56cfcc99
   */
  if (CapacityPlanOptions.find({ startDate: { $exists: true } }).count()) {
    console.log("UPGRADE: Migrating startDate from CapacityPlanOptions to CapacityPlans");
    
    CapacityPlans.find({ startDate: { $exists: false } }).forEach((plan) => {
      console.log("UPGRADE: Setting CapacityPlan.startDate for plan that doesn't have one set:", plan._id, plan.title);
      
      // Get an option and use that start date
      let option = CapacityPlanOptions.findOne({ planId: plan._id });
      
      if (option && option.startDate) {
        // Pull the start date from the option to the plan
        CapacityPlans.update(plan._id, { $set: { startDate: option.startDate } });
        console.log("UPGRADE: CapacityPlan.startDate set:", plan._id, plan.title, option.startDate);
      } else {
        console.log("UPGRADE: Failed to locate any options for plan:", plan._id, plan.title)
      }
    });
    
    // Remote the startDate data from the options to avoid confusion
    console.log("UPGRADE: Removing startDate from all CapacityPlanOptions");
    CapacityPlanOptions.update({ startDate: { $exists: true } }, { $unset: { startDate: "" } });
  }
}
