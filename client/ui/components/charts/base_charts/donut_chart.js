import './donut_chart.html';
import './donut_chart.css';
import { Session }        from 'meteor/session';
import { Template }       from 'meteor/templating';
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
  instance.$('.chart').attr('id', instance.elementId);
  
  instance.autorun(() => {
    let context = Template.currentData(),
        resize  = Session.get('resize');
    
    if (context.config.scaleVar) {
      let scale = context.config.scaleVar.get();
    }
    
    // Clear any previous timeouts in flight
    clearTimeout(instance.updateTimeout);
    
    // Throttle the update rate
    instance.updateTimeout = setTimeout(() => {
      if (instance.chart === undefined) {
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
