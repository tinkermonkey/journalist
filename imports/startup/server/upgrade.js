/**
 * Schema upgrade scripts that will fix data model changes
 **/
import { CapacityPlans }       from '../../api/capacity_plans/capacity_plans';
import { CapacityPlanOptions } from '../../api/capacity_plans/capacity_plan_options';

// Start date was moved from CapacityPlanOption to CapacityPlan on 3/11/2018
CapacityPlans.find({ startDate: { $exists: false } }).forEach((plan) => {
  console.log("UPGRADE: Setting CapacityPlan.startDate for plan that doesn't have one set:", plan._id, plan.title);
  
  // Get an option and use that start date
  let option = CapacityPlanOptions.findOne({ planId: plan._id });
  
  if(option){
  
  } else {
    console.log("UPGRADE: Failed to locate any options for plan:")
  }
});