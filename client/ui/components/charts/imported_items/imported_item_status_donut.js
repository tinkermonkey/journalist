import './imported_item_status_donut.html';
import { Template }      from 'meteor/templating';
import { ImportedItems } from '../../../../../imports/api/imported_items/imported_items';

/**
 * Template Helpers
 */
Template.ImportedItemStatusDonut.helpers({
  chartContext () {
    let context = this;
    return {
      cssClass: 'chart-flex',
      config  : {
        scaleVar      : context.scaleVar,
        valueAttribute: 'statusLabel',
        callouts      : {
          show : true,
          align: false
        },
        chart         : {
          donut : {
            title: 'Status',
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
          return value
        },
        onclick (d, element) {
          this.chart.revert();
          if (context && context.filterVar) {
            let filter = context.filterVar.get() || {};
            if (filter.statusLabel) {
              delete filter.statusLabel;
            } else {
              filter.statusLabel = {
                key        : 'statusLabel',
                value      : { $regex: d.id, $options: 'i' },
                title      : 'Status',
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
Template.ImportedItemStatusDonut.events({});

/**
 * Template Created
 */
Template.ImportedItemStatusDonut.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ImportedItemStatusDonut.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ImportedItemStatusDonut.onDestroyed(() => {
  
});
