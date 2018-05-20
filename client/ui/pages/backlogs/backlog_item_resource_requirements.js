import './backlog_item_resource_requirements.html';
import { Template }                        from 'meteor/templating';
import { BacklogItemResourceRequirements } from '../../../../imports/api/backlogs/backlog_item_resource_requirements';

/**
 * Template Helpers
 */
Template.BacklogItemResourceRequirements.helpers({
  requirements () {
    let item = this;
    
    return BacklogItemResourceRequirements.find({ backlogItemId: item._id })
  },
  multipleResources () {
    return this.roleQuantity > 1
  },
  multipleDuration () {
    return this.durationQuantity > 1
  }
});

/**
 * Template Event Handlers
 */
Template.BacklogItemResourceRequirements.events({});

/**
 * Template Created
 */
Template.BacklogItemResourceRequirements.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let item = Template.currentData();
    
    if (item) {
      instance.subscribe('backlog_item_resource_requirements', item._id);
    }
  })
});

/**
 * Template Rendered
 */
Template.BacklogItemResourceRequirements.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.BacklogItemResourceRequirements.onDestroyed(() => {
  
});
