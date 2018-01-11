import './weekly_support_report.html';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { ImportedItems } from '../../../../../imports/api/imported_items/imported_items';
import { ImportedItemCrumbs } from '../../../../../imports/api/imported_items/imported_item_crumbs';
import { Projects } from '../../../../../imports/api/projects/projects';
import '../../../components/charts/donut_chart';

/**
 * Template Helpers
 */
Template.WeeklySupportReport.helpers({
  project() {
    return Projects.findOne();
  },
  installationsAffected() {
    let project = this,
      timeRange = Template.instance().dateRange.get();
    return ImportedItems.find({

    });
  },
  supportAreas() {

  }
});

/**
 * Template Event Handlers
 */
Template.WeeklySupportReport.events({});

/**
 * Template Created
 */
Template.WeeklySupportReport.onCreated(() => {

});

/**
 * Template Rendered
 */
Template.WeeklySupportReport.onRendered(() => {
  let instance = Template.instance();

  instance.dateRange = new ReactiveVar({
    start: moment().subtract(10, 'days').toDate(),
    end: moment().subtract(3, 'days').toDate()
  });

  instance.autorun(() => {
    let projectId = FlowRouter.getParam('projectId'),
      dateRange = instance.dateRange.get();

    instance.subscribe('imported_item_crumb_query', { projectId: projectId });
    //instance.subscribe('imported_item_query', { projectId: projectId });
    instance.subscribe('imported_item_query', {
      projectId: projectId,
      $or: [
        { dateCreated: { $gte: dateRange.start, $lte: dateRange.end } },
        { statusLabel: { $not: /resolved/i} },
        {
          statusHistory: {
            $elemMatch: {
              date: { $gte: dateRange.start, $lte: dateRange.end },
              'to.label': { $regex: 'resolved', $options: 'i' }
            }
          }
        },
      ]
    });
  });
});

/**
 * Template Destroyed
 */
Template.WeeklySupportReport.onDestroyed(() => {

});
