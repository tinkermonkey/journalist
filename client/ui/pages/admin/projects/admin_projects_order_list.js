import './admin_projects_order_list.html';
import { Template } from 'meteor/templating';
import { Projects } from '../../../../../imports/api/projects/projects';

/**
 * Template Helpers
 */
Template.AdminProjectsOrderList.helpers({
  projects () {
    return Projects.find({ showOnDashboard: true }, { sort: { sortOrder: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.AdminProjectsOrderList.events({});

/**
 * Template Created
 */
Template.AdminProjectsOrderList.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminProjectsOrderList.onRendered(() => {
  let instance = Template.instance();
  
  instance.$('.sortable-table')
      .sortable({
        items               : '> .sortable-table-row',
        handle              : '.drag-handle',
        helper (e, ui) {
          // fix the width
          ui.children().each(function () {
            $(this).width($(this).width());
          });
          return ui;
        },
        axis                : 'y',
        forcePlaceholderSize: true,
        update (event, ui) {
          instance.$('.sortable-table-row').each(function (i, el) {
            let newOrder    = i + 1,
                storedOrder = $(el).attr('data-sort-order');
            if (newOrder !== storedOrder) {
              let rowId = $(el).attr('data-pk');
              console.log('Updating order: ', newOrder, rowId);
              Meteor.call('editProject', rowId, 'sortOrder', newOrder, function (error, response) {
                if (error) {
                  RobaDialog.error('Project order update failed: ' + error.message);
                }
              });
            }
          });
        }
      })
      .disableSelection();
});

/**
 * Template Destroyed
 */
Template.AdminProjectsOrderList.onDestroyed(() => {
  
});
