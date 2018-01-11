import './weekly_support_report.html';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/moment:moment';
import { ImportedItems } from '../../../../../imports/api/imported_items/imported_items';
import { ImportedItemCrumbs } from '../../../../../imports/api/imported_items/imported_item_crumbs';
import { Projects} from '../../../../../imports/api/projects/projects';
import '../../../components/charts/donut_chart';

/**
 * Template Helpers
 */
Template.WeeklySupportReport.helpers({
  project(){
    return Projects.findOne();
  },
  installationsAffected(){
    let project = this,
        timeRange = Template.instance().dateRange.get();
    return ImportedItems.find({
    
    });
  },
  supportAreas(){
  
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
  let instance = Template.instance(),
  today = moment();
  
  instance.dateRange = new ReactiveVar({
    start: moment().subtract(3, 'days'),
    end: moment().subtract(5, 'days')
  });
  
  instance.autorun(() => {
    let projectId = FlowRouter.getParam('projectId');
    
    instance.subscribe('imported_item_crumb_query', { projectId: projectId });
    instance.subscribe('imported_items', {
      projectId: projectId,
    });
  });
});

/**
 * Template Destroyed
 */
Template.WeeklySupportReport.onDestroyed(() => {
  
});
