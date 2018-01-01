import './contributor_items.html';
import { Template } from 'meteor/templating';
import { ImportedItemWorkStates } from '../../../../imports/api/imported_items/imported_item_work_states';
import { Util } from '../../../../imports/api/util';

/**
 * Template Helpers
 */
Template.ContributorItems.helpers({
  workStates () {
    return _.keys(ImportedItemWorkStates).map((key) => {
      return { key: key, title: Util.camelToTitle(key) }
    })
  },
  workStateAssignedItemsContext (contributor) {
    let workStateKey = this.key;
    return {
      query: { owner: contributor._id, workState: ImportedItemWorkStates[ workStateKey ] },
      sort : { dateModified: -1 }
    }
  },
  workStateCreatedItemsContext (contributor) {
    let workStateKey = this.key;
    return {
      query: { createdBy: contributor._id, workState: ImportedItemWorkStates[ workStateKey ] },
      sort : { dateModified: -1 }
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
