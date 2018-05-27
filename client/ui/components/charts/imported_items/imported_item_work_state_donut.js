import './imported_item_work_state_donut.html';
import { Template }               from 'meteor/templating';
import { Util }                   from '../../../../../imports/api/util';
import { ImportedItemWorkStates } from '../../../../../imports/api/imported_items/imported_item_work_states';
import { ImportedItems }          from '../../../../../imports/api/imported_items/imported_items';
import '../donut_chart';

let WorkStateTitleLookup = {};
_.keys(ImportedItemWorkStates).forEach((key) => {
  WorkStateTitleLookup[ Util.camelToTitle(key) ] = ImportedItemWorkStates[ key ];
});

/**
 * Template Helpers
 */
Template.ImportedItemWorkStateDonut.helpers({
  chartContext () {
    let context = this;
    return {
      cssClass: 'chart-flex',
      config  : {
        scaleVar: context.scaleVar,
        valueAttribute: 'workState',
        callouts      : {
          show : true,
          align: false
        },
        chart         : {
          donut : {
            title: [ 'Work', 'State' ],
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
          return Util.camelToTitle(_.invert(ImportedItemWorkStates)[ value ])
        },
        onclick (d, element) {
          this.chart.revert();
          let workState = WorkStateTitleLookup[d.id];
          if (context && context.filterVar) {
            let filter = context.filterVar.get() || {};
            if (filter.workState) {
              delete filter.workState;
            } else if(workState !== undefined) {
              filter.workState = {
                key        : 'workState',
                value      : workState,
                title      : 'Work State',
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
Template.ImportedItemWorkStateDonut.events({});

/**
 * Template Created
 */
Template.ImportedItemWorkStateDonut.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ImportedItemWorkStateDonut.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ImportedItemWorkStateDonut.onDestroyed(() => {
  
});
