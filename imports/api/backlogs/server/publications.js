import { Meteor }                          from 'meteor/meteor';
import { Backlogs }                        from '../backlogs';
import { BacklogItems }                    from '../backlog_items';
import { BacklogItemCategories }           from '../backlog_item_categories';
import { BacklogItemResourceAllocations }  from '../backlog_item_resource_allocations';
import { BacklogItemResourceRequirements } from '../backlog_item_resource_requirements';

Meteor.publish('backlogs', function () {
  console.log('Publish: backlogs');
  if (this.userId) {
    return Backlogs.find({ isPublic: true });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('admin_backlogs', function () {
  console.log('Publish: admin_backlogs');
  if (this.userId) {
    // Verify the user has permission to access this
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return Backlogs.find({});
    } else {
      console.warn('admin_backlog requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('admin_backlog', function (backlogId) {
  console.log('Publish: admin_backlog');
  if (this.userId) {
    // Verify the user has permission to access this
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return Backlogs.find({ _id: backlogId });
    } else {
      console.warn('admin_backlog requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('backlog_items', function () {
  console.log('Publish: backlog_items');
  if (this.userId) {
    return BacklogItems.find({ isPublic: true });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('admin_backlog_items', function (backlogId) {
  console.log('Publish: admin_backlog_items', backlogId);
  if (this.userId) {
    // Verify the user has permission to access this
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return BacklogItems.find({ backlogIds: backlogId });
    } else {
      console.warn('admin_backlog requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('backlog_item_resource_allocations', function (itemId) {
  console.log('Publish: backlog_item_resource_allocations', itemId);
  if (this.userId) {
    return BacklogItemResourceAllocations.find({ backlogItemId: itemId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('backlog_item_resource_requirements', function (itemId) {
  console.log('Publish: backlog_item_resource_requirements', itemId);
  if (this.userId) {
    return BacklogItemResourceRequirements.find({ backlogItemId: itemId });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('backlog_item_categories', function () {
  console.log('Publish: backlog_item_categories');
  if (this.userId) {
    return BacklogItemCategories.find({});
  } else {
    this.ready();
    return [];
  }
});
