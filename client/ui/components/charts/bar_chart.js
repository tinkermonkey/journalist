import './bar_chart.html';
import './bar_chart.css';
import { Template } from 'meteor/templating';
import { C3BarWrapper } from './c3_bar_wrapper';

/**
 * Template Helpers
 */
Template.BarChart.helpers({});

/**
 * Template Event Handlers
 */
Template.BarChart.events({});

/**
 * Template Created
 */
Template.BarChart.onCreated(() => {
});

/**
 * Template Rendered
 */
Template.BarChart.onRendered(() => {
  let instance = Template.instance();

  // Set the elementId
  instance.$('.bar-chart').attr('id', instance.elementId);

  instance.autorun(() => {
    let context = Template.currentData();

    // Clear any previous timeouts in flight
    clearTimeout(instance.updateTimeout);

    // Throttle the update rate
    instance.updateTimeout = setTimeout(() => {
      if (!instance.chart) {
        instance.chart = new C3BarWrapper(instance.elementId, context.config);
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
Template.BarChart.onDestroyed(() => {

});
