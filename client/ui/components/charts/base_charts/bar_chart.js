import './bar_chart.html';
import './bar_chart.css';
import { Session }       from 'meteor/session';
import { Template }     from 'meteor/templating';
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
  instance.$('.chart').attr('id', instance.elementId);
  
  instance.autorun(() => {
    let context = Template.currentData(),
        resize  = Session.get('resize');
    
    // Clear any previous timeouts in flight
    clearTimeout(instance.updateTimeout);
    
    // Throttle the update rate
    instance.updateTimeout = setTimeout(() => {
      if (!instance.chart) {
        instance.chart = new C3BarWrapper(instance.elementId, context.config);
        instance.chart.generate(context.data)
      }
      
      instance.chart.update(context.data)
    }, 125);
  });
});

/**
 * Template Destroyed
 */
Template.BarChart.onDestroyed(() => {

});
