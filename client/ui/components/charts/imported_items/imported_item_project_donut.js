import './imported_item_project_donut.html';
import { Template }      from 'meteor/templating';
import { Projects }      from '../../../../../imports/api/projects/projects';
import { ImportedItems } from '../../../../../imports/api/imported_items/imported_items';
import '../donut_chart';

/**
 * Template Helpers
 */
Template.ImportedItemProjectDonut.helpers({
  chartContext () {
    let context = this;
    return {
      cssClass: 'chart-flex',
      config  : {
        scaleVar: context.scaleVar,
        valueAttribute: 'projectId',
        callouts      : {
          show : true,
          align: false
        },
        chart         : {
          donut : {
            title: 'Project',
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
        renderLabel (projectId) {
          let project = Projects.findOne(projectId);
          return project && project.title
        },
        onclick (d, element) {
          this.chart.revert();
          let project = Projects.findOne({ title: d.id });
          if (context && context.filterVar) {
            let filter = context.filterVar.get() || {};
            if (filter.projectId) {
              delete filter.projectId;
            } else if (project !== undefined) {
              filter.projectId = {
                key        : 'projectId',
                value      : project._id,
                title      : 'Project',
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
Template.ImportedItemProjectDonut.events({});

/**
 * Template Created
 */
Template.ImportedItemProjectDonut.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ImportedItemProjectDonut.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ImportedItemProjectDonut.onDestroyed(() => {
  
});
