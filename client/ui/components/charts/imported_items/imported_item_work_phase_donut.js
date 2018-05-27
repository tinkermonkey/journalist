import './imported_item_work_phase_donut.html';
import { Template }               from 'meteor/templating';
import { Util }                   from '../../../../../imports/api/util';
import { ImportedItems }          from '../../../../../imports/api/imported_items/imported_items';
import { ImportedItemWorkPhases } from '../../../../../imports/api/imported_items/imported_item_work_phases';
import '../donut_chart';

let WorkPhaseTitleLookup = {};
_.keys(ImportedItemWorkPhases).forEach((key) => {
  WorkPhaseTitleLookup[ Util.camelToTitle(key) ] = ImportedItemWorkPhases[ key ];
});

/**
 * Template Helpers
 */
Template.ImportedItemWorkPhaseDonut.helpers({
  chartContext () {
    let context = this;
    return {
      cssClass: 'chart-flex',
      config  : {
        scaleVar: context.scaleVar,
        valueAttribute: 'workPhase',
        callouts      : {
          show : true,
          align: false
        },
        chart         : {
          donut : {
            title: [ 'Work', 'Phase' ],
            label: {
              format (value, ratio, id) {
                return value
              }
            }
          },
          legend: {
            show: false
          }
        },
        renderLabel (value) {
          return Util.camelToTitle(_.invert(ImportedItemWorkPhases)[ value ])
        },
        onclick (d, element) {
          this.chart.revert();
          let workPhase = WorkPhaseTitleLookup[ d.id ];
          if (context && context.filterVar) {
            let filter = context.filterVar.get() || {};
            if (filter.workPhase) {
              delete filter.workPhase;
            } else if (workPhase !== undefined) {
              filter.workPhase = {
                key        : 'workPhase',
                value      : workPhase,
                title      : 'Work Phase',
                prettyValue: d.id
              };
            }
            
            context.filterVar.set(filter);
          }
        }
      },
      data    : context.items ? context.items : ImportedItems.find(context && context.query || {}).fetch()
    }
  }
});

/**
 * Template Event Handlers
 */
Template.ImportedItemWorkPhaseDonut.events({});

/**
 * Template Created
 */
Template.ImportedItemWorkPhaseDonut.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ImportedItemWorkPhaseDonut.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ImportedItemWorkPhaseDonut.onDestroyed(() => {
  
});
