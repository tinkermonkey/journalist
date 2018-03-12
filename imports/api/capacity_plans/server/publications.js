import { Meteor }                           from 'meteor/meteor';
import { CapacityPlans }                    from '../capacity_plans';
import { CapacityPlanOptions }              from '../capacity_plan_options';
import { CapacityPlanSprints }              from '../capacity_plan_sprints';
import { CapacityPlanReleases }             from '../capacity_plan_releases';
import { CapacityPlanSprintBlocks }         from '../capacity_plan_sprint_blocks';
import { CapacityPlanSprintLinks }          from '../capacity_plan_sprint_links';
import { CapacityPlanStrategicEfforts }     from '../capacity_plan_strategic_efforts';
import { CapacityPlanStrategicEffortItems } from '../capacity_plan_strategic_effort_items';

Meteor.publish('capacity_plans', function () {
  console.info('Publish: capacity_plans');
  if (this.userId) {
    return CapacityPlans.find({});
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_options', function () {
  console.info('Publish: capacity_plan_options');
  if (this.userId) {
    return CapacityPlanOptions.find({});
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_releases', function () {
  console.info('Publish: capacity_plan_releases');
  if (this.userId) {
    return CapacityPlanReleases.find({});
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_sprints', function (planId) {
  console.info('Publish: capacity_plan_sprints');
  if (this.userId) {
    return CapacityPlanSprints.find({ planId: planId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_sprint_blocks', function (planId) {
  console.info('Publish: capacity_plan_sprint_blocks');
  if (this.userId) {
    return CapacityPlanSprintBlocks.find({ planId: planId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_sprint_links', function (planId) {
  console.info('Publish: capacity_plan_sprint_links');
  if (this.userId) {
    return CapacityPlanSprintLinks.find({ planId: planId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_strategic_efforts', function (planId) {
  console.info('Publish: capacity_plan_strategic_efforts');
  if (this.userId) {
    return CapacityPlanStrategicEfforts.find({ planId: planId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_strategic_effort_items', function (planId) {
  console.info('Publish: capacity_plan_strategic_effort_items');
  if (this.userId) {
    return CapacityPlanStrategicEffortItems.find({ planId: planId });
  } else {
    this.ready();
    return [];
  }
});
