import './capacity_plan_chart.html';
import './capacity_plan_chart.css';
import { Template } from 'meteor/templating';
import { D3CapacityPlanChart } from './d3_capacity_plan_chart';

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
    let context = Template.currentData(),
        resize  = instance.resize.get();
    
    if (!instance.chart) {
      instance.chart = new D3CapacityPlanChart(instance.elementId, context.config);
      instance.chart.generate(context.data);
    }
    
    instance.chart.update(context.data);
    return resize;
  });
  
});

/**
 * Template Destroyed
 */
Template.CapacityPlanChart.onDestroyed(() => {
  
});
