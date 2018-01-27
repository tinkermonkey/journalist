import { Meteor } from 'meteor/meteor';
import { CapacityPlans } from '../capacity_plans';
import { CapacityPlanOptions } from '../capacity_plan_options';
import { CapacityPlanSprints } from '../capacity_plan_sprints';
import { CapacityPlanSprintBlocks } from '../capacity_plan_sprint_blocks';
import {CapacityPlanSprintLinks} from '../capacity_plan_sprint_links';
import { CapacityPlanStrategicEfforts } from '../capacity_plan_strategic_efforts';
import { CapacityPlanStrategicEffortItems } from '../capacity_plan_strategic_effort_items';

Meteor.publish('capacity_plans', function () {
  console.info('Publish: capacity_plans');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return CapacityPlans.find({});
    } else {
      console.warn('capacity_plans requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_options', function () {
  console.info('Publish: capacity_plan_options');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return CapacityPlanOptions.find({});
    } else {
      console.warn('capacity_plan_options requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_sprints', function (planId) {
  console.info('Publish: capacity_plan_sprints');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return CapacityPlanSprints.find({ planId: planId });
    } else {
      console.warn('capacity_plan_sprints requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_sprint_blocks', function (planId) {
  console.info('Publish: capacity_plan_sprint_blocks');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return CapacityPlanSprintBlocks.find({ planId: planId });
    } else {
      console.warn('capacity_plan_sprint_blocks requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_sprint_links', function (planId) {
  console.info('Publish: capacity_plan_sprint_links');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return CapacityPlanSprintLinks.find({ planId: planId });
    } else {
      console.warn('capacity_plan_sprint_links requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_strategic_efforts', function (planId) {
  console.info('Publish: capacity_plan_strategic_efforts');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return CapacityPlanStrategicEfforts.find({ planId: planId });
    } else {
      console.warn('capacity_plan_strategic_efforts requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('capacity_plan_strategic_effort_items', function (planId) {
  console.info('Publish: capacity_plan_strategic_effort_items');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return CapacityPlanStrategicEffortItems.find({ planId: planId });
    } else {
      console.warn('capacity_plan_strategic_effort_items requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});
