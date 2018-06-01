import './imported_item_type_donut.html';
import { Template }      from 'meteor/templating';
import { Util }          from '../../../../../imports/api/util';
import { ItemTypes }     from '../../../../../imports/api/imported_items/item_types';
import { ImportedItems } from '../../../../../imports/api/imported_items/imported_items';
import '../base_charts/donut_chart';

let d3 = require('d3');

let ItemTypesTitleLookup = {};
_.keys(ItemTypes).forEach((key) => {
  ItemTypesTitleLookup[ Util.camelToTitle(key) ] = ItemTypes[ key ];
});

/**
 * Template Helpers
 */
Template.ImportedItemTypeDonut.helpers({
  chartContext () {
    let context = this;
    return {
      cssClass: 'chart-flex',
      config  : {
        scaleVar: context.scaleVar,
        valueAttribute: 'itemType',
        callouts: {
          show : true,
          align: false
        },
        chart   : {
          donut : {
            title: [ 'Item', 'Type' ],
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
          return Util.camelToTitle(_.invert(ItemTypes)[ value ])
        },
        onclick (d, element) {
          this.chart.revert();
          let itemType = ItemTypesTitleLookup[ d.id ];
          if (context && context.filterVar) {
            let filter = context.filterVar.get() || {};
            if (filter.itemType) {
              delete filter.itemType;
            } else if (itemType !== undefined) {
              filter.itemType = {
                key        : 'itemType',
                value      : itemType,
                title      : 'Item Type',
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
Template.ImportedItemTypeDonut.events({});

/**
 * Template Created
 */
Template.ImportedItemTypeDonut.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ImportedItemTypeDonut.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ImportedItemTypeDonut.onDestroyed(() => {
  
});
