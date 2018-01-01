import './donut_chart.html';
import './donut_chart.css';
import { Template } from 'meteor/templating';
import { C3DonutWrapper } from './c3_donut_wrapper';

/**
 * Template Helpers
 */
Template.DonutChart.helpers({});

/**
 * Template Event Handlers
 */
Template.DonutChart.events({});

/**
 * Template Created
 */
Template.DonutChart.onCreated(() => {
});

/**
 * Template Rendered
 */
Template.DonutChart.onRendered(() => {
  let instance = Template.instance();
  
  // Set the elementId
  instance.$('.donut-chart').attr('id', instance.elementId);
  
  instance.autorun(() => {
    let context = Template.currentData();
    
    // Clear any previous timeouts in flight
    clearTimeout(instance.updateTimeout);
    
    // Throttle the update rate
    instance.updateTimeout = setTimeout(() => {
      if (!instance.chart) {
        instance.chart = new C3DonutWrapper(instance.elementId, context.config);
        instance.chart.generate(context.data)
      } else {
        instance.chart.update(context.data)
      }
    }, 125);
  });
});

/**
 * Template Destroyed
 */
Template.DonutChart.onDestroyed(() => {
  
});
