import './galaxy_chart_view.html';
import './galaxy_chart.css';
import { Template }    from 'meteor/templating';
import { Session }     from 'meteor/session';
import { GalaxyChart } from './galaxy_chart.js';
import { DataPoints }  from './data_points.js';
import { Dimensions }  from './dimensions.js';

let chartSvgSelector = '.galaxy-chart',
    debug            = true;

/**
 * Template Helpers
 */
Template.GalaxyChartView.helpers({});

/**
 * Template Event Handlers
 */
Template.GalaxyChartView.events({});

/**
 * Template Created
 */
Template.GalaxyChartView.onCreated(() => {
  let instance = Template.instance();
  
  // Go to a dimension
  instance.autorun(() => {
    let data = Template.currentData();
    if (data.dimensionId) {
      debug && console.log('GalaxyChartView subscribing to data points for dimension', data.dimensionId);
      instance.subscribe('data-points', data.dimensionId, () => {
        console.log('DataPoints subscription is ready');
      });
    } else {
      console.error('GalaxyChartView loaded without dimensionId');
    }
  })
});

/**
 * Template Rendered
 */
Template.GalaxyChartView.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    if (instance.subscriptionsReady() && !instance.chart) {
      debug && console.log('GalaxyChartView initializing:', chartSvgSelector);
      
      // Listen for interaction events from the chart
      $(chartSvgSelector).on('nodeCreated', (event, data) => {
        //console.log('nodeCreated:', event, data);
      });
      $(chartSvgSelector).on('nodeRemoved', (event, data) => {
        debug && console.log('nodeRemoved:', data);
      });
      $(chartSvgSelector).on('nodeClick', (event, data) => {
        debug && console.log('nodeClick:', data);
      });
      $(chartSvgSelector).on('nodeDblClick', (event, data) => {
        debug && console.log('nodeDblClick:', data);
      });
      $(chartSvgSelector).on('nodeMouseEnter', (event, data) => {
        debug && console.log('nodeMouseEnter:', data);
      });
      $(chartSvgSelector).on('nodeMouseLeave', (event, data) => {
        debug && console.log('nodeMouseLeave:', data);
      });
      $(chartSvgSelector).on('nodeDragStarted', (event, data) => {
        debug && console.log('nodeDragStarted:', data);
      });
      $(chartSvgSelector).on('nodeDragEnded', (event, data) => {
        debug && console.log('nodeDragEnded:', data);
      });
      
      // Grab the size of the chart
      let chartWidth  = instance.$(chartSvgSelector).width(),
          chartHeight = instance.$(chartSvgSelector).height();
      
      debug && console.log('GalaxyChartView display dimensions:', chartWidth, chartHeight);
      
      // Get the initial data
      let context    = Template.currentData(),
          dimension  = Dimensions.findOne(context.dimensionId),
          dataPoints = DataPoints.find({ dimensionId: context.dimensionId }, { reactive: false });
      
      debug && console.log('GalaxyChartView dimension:', context.dimensionId);
      debug && console.log('GalaxyChartView data points:', dataPoints.count());
      debug && console.log('GalaxyChartView data points:', DataPoints.find({}).count());
      
      // Initialize the chart
      instance.chart = new GalaxyChart(chartSvgSelector, {}, true);
      instance.chart.init(chartWidth, chartHeight);
      instance.chart.update(dimension, dataPoints.fetch());
      instance.chart.zoomBounds();
    } else if (!instance.chart) {
      debug && console.log('GalaxyChartView waiting for subscriptions to be ready before initializing chart');
    } else {
      debug && console.log('GalaxyChartView already initialized, autorun doing nothing');
    }
  });
  
  // Listen for data updates
  instance.autorun(() => {
    let context    = Template.currentData(),
        dimension  = Dimensions.findOne(context.dimensionId),
        dataPoints = DataPoints.find({ dimensionId: context.dimensionId }).fetch();
    debug && console.log('GalaxyChartView data points update:', dataPoints.length);
    if (instance.chart && instance.subscriptionsReady()) {
      instance.chart.update(dimension, dataPoints);
    } else {
      debug && console.log('GalaxyChartView data points update deferred:', dataPoints.length);
    }
  });
  
  // Listen for resize events
  instance.autorun(() => {
    let resize      = Session.get('resize'),
        chartWidth  = instance.$(chartSvgSelector).width(),
        chartHeight = instance.$(chartSvgSelector).height();
    debug && console.log('GalaxyChartView resize:', chartWidth, chartHeight);
    if (instance.chart) {
      instance.chart.layout(chartWidth, chartHeight);
      instance.chart.zoomBounds();
    }
  });
  
});

/**
 * Template Destroyed
 */
Template.GalaxyChartView.onDestroyed(() => {

});
