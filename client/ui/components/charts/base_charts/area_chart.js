import './area_chart.html';
import './area_chart.css';
import { Session }       from 'meteor/session';
import { Template }      from 'meteor/templating';
import { C3AreaWrapper } from './c3_area_wrapper';

/**
 * Template Helpers
 */
Template.AreaChart.helpers({});

/**
 * Template Event Handlers
 */
Template.AreaChart.events({});

/**
 * Template Created
 */
Template.AreaChart.onCreated(() => {
});

/**
 * Template Rendered
 */
Template.AreaChart.onRendered(() => {
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
        instance.chart = new C3AreaWrapper(instance.elementId, context.config);
        instance.chart.generate(context.data);
      } else {
        instance.chart.update(context.data)
      }
    }, 125);
  });
});

/**
 * Template Destroyed
 */
Template.AreaChart.onDestroyed(() => {

});
