import './imported_item_timeline.html';
import './imported_item_timeline.css';
import { Template } from 'meteor/templating';
import { Util }     from '../../../../imports/api/util';
import '../contributors/contributor_link';

/**
 * Template Helpers
 */
Template.ImportedItemTimeline.helpers({
  timelineEntries () {
    let item    = this,
        entries = [ {
          number: 1,
          date  : item.dateCreated,
          data  : {
            actor: item.createdBy,
            title: 'Created'
          }
        } ];
    
    if (item.statusHistory) {
      item.statusHistory.forEach((entry, i) => {
        entries.push({
          number: i + 2,
          date  : entry.date,
          data  : {
            actor: entry.owner,
            title: entry.to && entry.to.label
          }
        })
      })
    }
    
    entries.forEach((entry, i) => {
      if (i < entries.length - 1) {
        let next    = entries[ i + 1 ];
        entry.delta = {
          workDays: Util.workDaysDiff(entry.date, next.date)
        };
      }
    });
    
    return entries
  }
});

/**
 * Template Event Handlers
 */
Template.ImportedItemTimeline.events({});

/**
 * Template Created
 */
Template.ImportedItemTimeline.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ImportedItemTimeline.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ImportedItemTimeline.onDestroyed(() => {
  
});
