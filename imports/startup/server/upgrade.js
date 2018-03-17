/**
 * Schema upgrade scripts that will fix data model changes
 */
import { Clustering }          from 'meteor/austinsand:journalist-clustering';
import { logger }              from 'meteor/austinsand:journalist-logger';
import { CapacityPlans }       from '../../api/capacity_plans/capacity_plans';
import { CapacityPlanOptions } from '../../api/capacity_plans/capacity_plan_options';

// Only run on the cluster master node
if (Clustering.isMaster()) {
  /**
   * Start date was moved from CapacityPlanOption to CapacityPlan on 3/11/2018
   *
   * https://github.com/austinsand/journalist/commit/2977d1380338671930034c4d11d645fd56cfcc99
   */
  if (CapacityPlanOptions.find({ startDate: { $exists: true } }).count()) {
    logger.info("UPGRADE: Migrating startDate from CapacityPlanOptions to CapacityPlans");
    
    CapacityPlans.find({ startDate: { $exists: false } }).forEach((plan) => {
      logger.info("UPGRADE: Setting CapacityPlan.startDate for plan that doesn't have one set:", plan._id, plan.title);
      
      // Get an option and use that start date
      let option = CapacityPlanOptions.findOne({ planId: plan._id });
      
      if (option && option.startDate) {
        // Pull the start date from the option to the plan
        CapacityPlans.update(plan._id, { $set: { startDate: option.startDate } });
        logger.info("UPGRADE: CapacityPlan.startDate set:", plan._id, plan.title, option.startDate);
      } else {
        logger.info("UPGRADE: Failed to locate any options for plan:", plan._id, plan.title)
      }
    });
    
    // Remote the startDate data from the options to avoid confusion
    logger.info("UPGRADE: Removing startDate from all CapacityPlanOptions");
    CapacityPlanOptions.update({ startDate: { $exists: true } }, { $unset: { startDate: "" } });
  }
}
