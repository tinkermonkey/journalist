import './admin_backlog_item_resource_requirements.html';
import { Template }                        from 'meteor/templating';
import { BacklogItemResourceRequirements } from '../../../../../imports/api/backlogs/backlog_item_resource_requirements';
import { ContributorRoleDefinitions }      from '../../../../../imports/api/contributors/contributor_role_definitions';

/**
 * Template Helpers
 */
Template.AdminBacklogItemResourceRequirements.helpers({
  resourceRequirements () {
    let item = this;
    if (item) {
      return BacklogItemResourceRequirements.find({ backlogItemId: item._id })
    }
  },
  rolesAvailable () {
    return Template.instance().rolesAvailable.get()
  },
  plannedRoleSelectorContext () {
    let rolesForPlanning = Template.instance().rolesForPlanning.get();
    return {
      valueField  : '_id',
      displayField: 'title',
      value       : this.roleDefinitionId,
      dataKey     : 'roleId',
      collection  : ContributorRoleDefinitions,
      emptyText   : 'Select role',
      cssClass    : 'inline-block',
      mode        : 'popup',
      sort        : { sort: { order: 1 } },
      query       : { _id: { $in: rolesForPlanning } }
    };
  }
});

/**
 * Template Event Handlers
 */
Template.AdminBacklogItemResourceRequirements.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    let requirementId = $(e.target).closest('.backlog-item-resource-requirement').attr('data-pk'),
        dataKey       = $(e.target).attr('data-key');
    
    if (requirementId && dataKey) {
      Meteor.call('editBacklogItemResourceRequirement', requirementId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-add-requirement' (e, instance) {
    let item           = this,
        rolesAvailable = instance.rolesAvailable.get();
    
    if (rolesAvailable.length) {
      Meteor.call('addBacklogItemResourceRequirement', item._id, rolesAvailable[ 0 ], function (error, response) {
        if (error) {
          RobaDialog.error('Adding roles failed: ' + error.message);
        }
      });
    } else {
      RobaDialog.error('There are no capacity-planned roles that are not already required for this item')
    }
  },
  'click .btn-delete-requirement' (e, instance) {
    let requirement = this;
    
    Meteor.call('deleteBacklogItemResourceRequirement', requirement._id, function (error, response) {
      if (error) {
        RobaDialog.error('Delete failed: ' + error.message);
      }
    });
  }
});

/**
 * Template Created
 */
Template.AdminBacklogItemResourceRequirements.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let item = Template.currentData();
    
    if (item) {
      instance.subscribe('backlog_item_resource_requirements', item._id)
    }
  });
  
  // Keep track of the set of roles that we should list
  instance.rolesForPlanning = new ReactiveVar([]);
  instance.autorun(() => {
    let plannedRoleIds = ContributorRoleDefinitions.find({ planCapacity: true }).map((role) => {
      let capacityRole = role.capacityRole();
      return capacityRole && capacityRole._id
    });
    
    instance.rolesForPlanning.set(_.uniq(plannedRoleIds))
  });
  
  // Keep track of whether there are more roles to track
  instance.rolesAvailable = new ReactiveVar([]);
  instance.autorun(() => {
    let item = Template.currentData();
    if (item && instance.subscriptionsReady()) {
      let plannedRoles     = BacklogItemResourceRequirements.find({ backlogItemId: item._id }).map((role) => {
            return role.roleDefinitionId
          }),
          rolesForPlanning = instance.rolesForPlanning.get();
      
      console.log('AdminBacklogItemResourceRequirements.autorun:', plannedRoles, rolesForPlanning, _.difference(rolesForPlanning, plannedRoles));
      instance.rolesAvailable.set(_.difference(rolesForPlanning, plannedRoles))
    } else {
      instance.rolesAvailable.set([]);
    }
  });
});

/**
 * Template Rendered
 */
Template.AdminBacklogItemResourceRequirements.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminBacklogItemResourceRequirements.onDestroyed(() => {
  
});
