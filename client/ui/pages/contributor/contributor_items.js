import './contributor_items.html';
import { Template } from 'meteor/templating';
import {ImportedItemWorkPhases} from '../../../../imports/api/imported_items/imported_item_work_phases';
import {ImportedItemWorkStates} from '../../../../imports/api/imported_items/imported_item_work_states';

/**
 * Template Helpers
 */
Template.ContributorItems.helpers({
  needsToBeWorkedItemsContext () {
    let contributor = this;
    return {
      query: { owner: contributor._id, workState: ImportedItemWorkStates.needsToBeWorked },
      sort : { dateModified: -1 }
    }
  },
  beingWorkedOnItemsContext () {
    let contributor = this;
    return {
      query: { owner: contributor._id, workState: ImportedItemWorkStates.beingWorkedOn },
      sort: { dateModified: -1 }
    }
  },
  completedItemsContext () {
    let contributor = this;
    return {
      query: { owner: contributor._id, workState: ImportedItemWorkStates.workCompleted },
      sort: { dateModified: -1 }
    }
  },
  createdNeedsToBeWorkedItemsContext () {
    let contributor = this;
    return {
      query: { createdBy: contributor._id, workState: ImportedItemWorkStates.needsToBeWorked },
      sort : { dateModified: -1 }
    }
  },
  createdBeingWorkedOnItemsContext () {
    let contributor = this;
    return {
      query: { createdBy: contributor._id, workState: ImportedItemWorkStates.beingWorkedOn },
      sort: { dateModified: -1 }
    }
  },
  createdCompletedItemsContext () {
    let contributor = this;
    return {
      query: { createdBy: contributor._id, workState: ImportedItemWorkStates.workCompleted },
      sort: { dateModified: -1 }
    }
  }
});

/**
 * Template Event Handlers
 */
Template.ContributorItems.events({});

/**
 * Template Created
 */
Template.ContributorItems.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ContributorItems.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ContributorItems.onDestroyed(() => {
  
});
