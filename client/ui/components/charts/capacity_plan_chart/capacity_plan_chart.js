import './capacity_plan_chart.html';
import './capacity_plan_chart.css';
import { Template }                     from 'meteor/templating';
import { D3CapacityPlanChart }          from './d3_capacity_plan_chart';
import { CapacityPlanStrategicEfforts } from '../../../../../imports/api/capacity_plans/capacity_plan_strategic_efforts';
import { CapacityPlanSprintBlocks }     from '../../../../../imports/api/capacity_plans/capacity_plan_sprint_blocks';
import { CapacityPlanSprintLinks }      from '../../../../../imports/api/capacity_plans/capacity_plan_sprint_links';
import { CapacityPlanBlockTypes }       from '../../../../../imports/api/capacity_plans/capacity_plan_block_types';

/**
 * Template Helpers
 */
Template.CapacityPlanChart.helpers({});

/**
 * Template Event Handlers
 */
Template.CapacityPlanChart.events({});

/**
 * Template Created
 */
Template.CapacityPlanChart.onCreated(() => {
  let instance = Template.instance();
  
  instance.resize = new ReactiveVar(Date.now());
  
  instance.lastResizeFired = Date.now();
  window.addEventListener('resize', () => {
    if ((Date.now() - instance.lastResizeFired) > 250) {
      instance.lastResizeFired = Date.now();
      instance.resize.set(Date.now());
    }
  });
});

/**
 * Template Rendered
 */
Template.CapacityPlanChart.onRendered(() => {
  let instance = Template.instance();
  
  // Set the elementId
  instance.$('.chart').attr('id', instance.elementId);
  
  instance.autorun(() => {
    let context   = Template.currentData(),
        resize    = instance.resize.get(),
        option    = context.option,
        chartData = {
          option          : option,
          plan            : option.plan(),
          sprints         : option.sprints().fetch(),
          contributorLinks: CapacityPlanSprintLinks.find({ optionId: option._id, targetType: CapacityPlanBlockTypes.contributor })
              .fetch(),
          blocks          : CapacityPlanSprintBlocks.find({
            optionId : option._id,
            blockType: { $in: [ CapacityPlanBlockTypes.contributor, CapacityPlanBlockTypes.effort ] }
          }).fetch(),
          roleId          : context.roleId,
          efforts         : CapacityPlanStrategicEfforts.find({ planId: option.planId }, { sort: { title: 1 } }).fetch(),
          releases        : CapacityPlanSprintBlocks.find({ optionId: option._id, blockType: CapacityPlanBlockTypes.release }).fetch(),
          releaseLinks    : CapacityPlanSprintLinks.find({ optionId: option._id, targetType: CapacityPlanBlockTypes.release }).fetch()
        };
    
    if (!instance.chart) {
      instance.chart = new D3CapacityPlanChart(instance.elementId, context.config);
      instance.chart.generate(chartData);
    }
    
    instance.chart.update(chartData);
    return resize;
  });
  
});

/**
 * Template Destroyed
 */
Template.CapacityPlanChart.onDestroyed(() => {
  
});
