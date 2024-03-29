import { Meteor }                           from 'meteor/meteor';
import { CapacityPlans }                    from '../capacity_plans';
import { CapacityPlanOptions }              from '../capacity_plan_options';
import { CapacityPlanSprints }              from '../capacity_plan_sprints';
import { CapacityPlanReleases }             from '../capacity_plan_releases';
import { CapacityPlanSprintBlocks }         from '../capacity_plan_sprint_blocks';
import { CapacityPlanSprintLinks }          from '../capacity_plan_sprint_links';
import { CapacityPlanStrategicEfforts }     from '../capacity_plan_strategic_efforts';
import { CapacityPlanStrategicEffortItems } from '../capacity_plan_strategic_effort_items';

Meteor.publish('active_capacity_plans', function () {
  console.info('Publish: active_capacity_plans');
  if (this.userId) {
    return CapacityPlans.find({ isActive: true });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan', function (planId) {
  console.info('Publish: capacity_plan', planId);
  if (this.userId) {
    return CapacityPlans.find({ _id: planId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plans', function () {
  console.info('Publish: capacity_plans');
  if (this.userId) {
    return CapacityPlans.find({});
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_options', function (planId) {
  console.info('Publish: capacity_plan_options', planId);
  if (this.userId) {
    return CapacityPlanOptions.find({ planId: planId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('all_capacity_plan_options', function () {
  console.info('Publish: all_capacity_plan_options');
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
  console.info('Publish: capacity_plan_sprints', planId);
  if (this.userId) {
    return CapacityPlanSprints.find({ planId: planId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_sprint_blocks', function (planId) {
  console.info('Publish: capacity_plan_sprint_blocks', planId);
  if (this.userId) {
    return CapacityPlanSprintBlocks.find({ planId: planId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_sprint_links', function (planId) {
  console.info('Publish: capacity_plan_sprint_links', planId);
  if (this.userId) {
    return CapacityPlanSprintLinks.find({ planId: planId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_strategic_efforts', function (planId) {
  console.info('Publish: capacity_plan_strategic_efforts', planId);
  if (this.userId) {
    return CapacityPlanStrategicEfforts.find({ planId: planId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_strategic_effort_items', function (planId) {
  console.info('Publish: capacity_plan_strategic_effort_items', planId);
  if (this.userId) {
    return CapacityPlanStrategicEffortItems.find({ planId: planId });
  } else {
    this.ready();
    return [];
  }
});
