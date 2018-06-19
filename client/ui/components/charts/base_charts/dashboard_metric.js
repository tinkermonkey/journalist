import './dashboard_metric.html';
import './dashboard_metric.css';
import { Template } from 'meteor/templating';

let d3 = require('d3');

d3.scale = require('d3-scale');

/**
 * Template Helpers
 */
Template.DashboardMetric.helpers({
  color () {
    let context     = this,
        customScale = Template.instance().customScale.get();
    
    if (customScale && context.customColorScale) {
      try {
        let numericValue = parseFloat(context.value),
            colorIndex   = parseInt((numericValue - context.customColorScale.min) / (context.customColorScale.max - context.customColorScale.min) * (context.customColorScale.max - context.customColorScale.min));
        
        colorIndex = Math.max(0, colorIndex);
        
        console.log('color:', numericValue, colorIndex, ((numericValue - context.customColorScale.min) / (context.customColorScale.max - context.customColorScale.min)) * (context.customColorScale.max - context.customColorScale.min));
        for (let i = 0; i < (context.customColorScale.max - context.customColorScale.min) * 2; i++) {
          console.log('DashboardMetric.color:', i, customScale(i));
        }
        return customScale(numericValue)
      } catch (e) {
        console.error('DashboardMetric.color failed:', e);
      }
    } else {
      return 'transparent'
    }
  }
});

/**
 * Template Event Handlers
 */
Template.DashboardMetric.events({});

/**
 * Template Created
 */
Template.DashboardMetric.onCreated(() => {
  let instance = Template.instance();
  
  instance.customScale = new ReactiveVar();
  
  instance.autorun(() => {
    let context = Template.currentData();
    
    if (context && context.customColorScale && context.customColorScale.stops) {
      try {
        let scale = d3.scale.scaleLinear()
            .domain(context.customColorScale.stops.map((stop) => { return stop.value }))
            .interpolate(d3.interpolateHcl)
            .range(context.customColorScale.stops.map((stop) => { return stop.color }));
        
        instance.customScale.set(scale);
      } catch (e) {
        console.error('DashboardMetric.autorun failed to calculate color scale:', e);
        instance.customScale.set(null);
      }
    } else {
      instance.customScale.set(null);
    }
  });
});

/**
 * Template Rendered
 */
Template.DashboardMetric.onRendered(() => {
});

/**
 * Template Destroyed
 */
Template.DashboardMetric.onDestroyed(() => {
  
});
