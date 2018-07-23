import './gauge_chart.html';
import './gauge_chart.css';
import { Session }        from 'meteor/session';
import { Template }       from 'meteor/templating';
import { C3GaugeWrapper } from './c3_gauge_wrapper';

/**
 * Template Helpers
 */
Template.GaugeChart.helpers({});

/**
 * Template Event Handlers
 */
Template.GaugeChart.events({});

/**
 * Template Created
 */
Template.GaugeChart.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.GaugeChart.onRendered(() => {
  let instance = Template.instance();
  
  // Set the elementId
  instance.$('.chart').attr('id', instance.elementId);
  
  instance.autorun(() => {
    let context = Template.currentData(),
        resize  = Session.get('resize');
    
    if (context.config && context.config.scaleVar) {
      let scale = context.config.scaleVar.get();
    }
    
    // Clear any previous timeouts in flight
    clearTimeout(instance.updateTimeout);
    
    // Throttle the update rate
    instance.updateTimeout = setTimeout(() => {
      if (instance.chart === undefined) {
        instance.chart = new C3GaugeWrapper(instance.elementId, context.config);
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
Template.GaugeChart.onDestroyed(() => {
  
});
