import './later_preview.html';
import { Template } from 'meteor/templating';
import { later }    from 'meteor/mrt:later';

/**
 * Template Helpers
 */
Template.LaterPreview.helpers({
  /**
   * Process the later directive if one exists
   * @return {*}
   */
  result () {
    if (this.directive) {
      let schedule  = later.parse.text(this.directive),
          rawResult = later.schedule(schedule).next(3);
      
      //console.log('LaterPreview:', schedule, rawResult);
      if (schedule.schedules.length) {
        return {
          next: rawResult
        }
      } else {
        return {
          error: 'Error: ' + schedule.error
        }
      }
    }
  }
});

/**
 * Template Event Handlers
 */
Template.LaterPreview.events({});

/**
 * Template Created
 */
Template.LaterPreview.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.LaterPreview.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.LaterPreview.onDestroyed(() => {
  
});
