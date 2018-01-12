import './admin_stats_imported_items.html';
import { Template } from 'meteor/templating';
import { ImportedItemCrumbs } from '../../../../../imports/api/imported_items/imported_item_crumbs';
import { ImportedItemWorkStates } from '../../../../../imports/api/imported_items/imported_item_work_states';
import { ImportedItemWorkPhases } from '../../../../../imports/api/imported_items/imported_item_work_phases';
import { ItemTypes } from '../../../../../imports/api/imported_items/item_types';
import { Projects } from '../../../../../imports/api/projects/projects';
import { Util } from '../../../../../imports/api/util';
import '../../../components/charts/donut_chart';

/**
 * Template Helpers
 */
Template.AdminStatsImportedItems.helpers({
  itemTypeChartContext () {
    let data = ImportedItemCrumbs.find();
    return {
      cssClass: 'chart-flex',
      config  : {
        title: { text: [ 'Items', 'By Type' ], showTotal: true },
        valueAttribute: 'itemType',
        renderLabel (value) {
          return Util.camelToTitle(_.invert(ItemTypes)[ value ])
        },
      },
      data    : data.fetch()
    }
  },
  itemProjectContext () {
    let data = ImportedItemCrumbs.find();
    return {
      cssClass: 'chart-flex',
      config  : {
        title: { text: [ 'Items', 'By Project' ], showTotal: true },
        valueAttribute: 'projectId',
        renderLabel (projectId) {
          let project = Projects.findOne(projectId);
          return project && project.title
        },
      },
      data    : data.fetch()
    }
  },
  itemWorkStatesContext () {
    let data = ImportedItemCrumbs.find();
    return {
      cssClass: 'chart-flex',
      config  : {
        title    : 'Work States',
        valueAttribute: 'workState',
        renderLabel (value) {
          return Util.camelToTitle(_.invert(ImportedItemWorkStates)[ value ])
        },
      },
      data    : data.fetch()
    }
  },
  itemWorkPhasesContext () {
    let data = ImportedItemCrumbs.find();
    return {
      cssClass: 'chart-flex',
      config  : {
        title    : 'Work Phases',
        valueAttribute: 'workPhase',
        renderLabel (value) {
          return Util.camelToTitle(_.invert(ImportedItemWorkPhases)[ value ])
        },
      },
      data    : data.fetch()
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdminStatsImportedItems.events({});

/**
 * Template Created
 */
Template.AdminStatsImportedItems.onCreated(() => {
  let instance = Template.instance();
  
  // Subscribe to all item crumbs
  instance.subscribe('imported_item_crumb_query', {});
});

/**
 * Template Rendered
 */
Template.AdminStatsImportedItems.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminStatsImportedItems.onDestroyed(() => {
  
});
