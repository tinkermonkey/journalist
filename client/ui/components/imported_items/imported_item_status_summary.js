import './imported_item_status_summary.html';
import { Template }               from 'meteor/templating';
import { ImportedItemWorkPhases } from '../../../../imports/api/imported_items/imported_item_work_phases';
import { ImportedItemWorkStates } from '../../../../imports/api/imported_items/imported_item_work_states';
import '../contributors/contributor_link';

let workPhaseLookup = _.invert(ImportedItemWorkPhases),
    workStateLookup = _.invert(ImportedItemWorkStates);

/**
 * Template Helpers
 */
Template.ImportedItemStatusSummary.helpers({
  workPhaseLabel () {
    return workPhaseLookup[ this.workPhase ]
  },
  workStateLabel () {
    return workStateLookup[ this.workState ]
  },
  workPhaseColor () {
    let item = this;
    
    switch (item.workPhase) {
      case ImportedItemWorkPhases.documentation:
        return 'danger';
      case ImportedItemWorkPhases.implementation:
        return 'warning';
      case ImportedItemWorkPhases.planning:
        return 'primary';
      case ImportedItemWorkPhases.verification:
        return 'success';
      default:
        return 'default'
    }
  },
  workStateColor () {
    let item = this;
    
    switch (item.workState) {
      case ImportedItemWorkStates.beingWorkedOn:
        return 'warning';
      case ImportedItemWorkStates.needsToBeWorked:
        return 'danger';
      case ImportedItemWorkStates.workCompleted:
        return 'success';
      default:
        return 'default'
    }
  }
});

/**
 * Template Event Handlers
 */
Template.ImportedItemStatusSummary.events({});

/**
 * Template Created
 */
Template.ImportedItemStatusSummary.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ImportedItemStatusSummary.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ImportedItemStatusSummary.onDestroyed(() => {
  
});
