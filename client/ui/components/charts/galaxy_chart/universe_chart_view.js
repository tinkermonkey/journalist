import './universe_chart_view.html';
import './universe_chart.css';
import { Template }      from 'meteor/templating';
import { Session }       from 'meteor/session';
import { UniverseChart } from './universe_chart.js';
import { Dimensions }    from './dimensions.js';
import { DataPoints }    from './data_points.js';

let chartSvgSelector = '.universe-chart',
    debug            = true;

/**
 * Template Helpers
 */
Template.UniverseChartView.helpers({});

/**
 * Template Event Handlers
 */
Template.UniverseChartView.events({});

/**
 * Template Created
 */
Template.UniverseChartView.onCreated(() => {
  let instance = Template.instance();
  
  // Go to a dimension
  instance.autorun(() => {
    /*
    Data is local only for now
    let data = Template.currentData();
    if (data.dimensionId) {
      debug && console.log('UniverseChartView subscribing to data points for dimension', data.dimensionId);
      instance.subscribe('data-points', data.dimensionId, () => {
        console.log('DataPoints subscription is ready');
      });
    } else {
      console.error('UniverseChartView loaded without dimensionId');
    }
    */
  })
});

/**
 * Template Rendered
 */
Template.UniverseChartView.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    if (!instance.chart) { // subscriptionsReady removed for local-only adaptation
      debug && console.log('UniverseChartView initializing:', chartSvgSelector);
      
      // Listen for interaction events from the chart
      $(chartSvgSelector).on('nodeCreated', (event, data) => {
        //console.log('nodeCreated:', event, data);
      });
      $(chartSvgSelector).on('nodeRemoved', (event, data) => {
        //debug && console.log('nodeRemoved:', data);
      });
      $(chartSvgSelector).on('nodeMouseDown', (event, data) => {
        debug && console.log('UniverseChartView.nodeMouseDown:', data);
        if (data.chart && data.chart.nodeControls) {
          data.chart.nodeControls.detach(false, true);
        }
      });
      $(chartSvgSelector).on('nodeMouseUp', (event, data) => {
        debug && console.log('UniverseChartView.nodeMouseUp:', data);
        if (data.chart && data.chart.highlightedNode) {
          data.chart.clearHighlight();
        }
      });
      $(chartSvgSelector).on('nodeClick', (event, data) => {
        //debug && console.log('nodeClick:', data);
      });
      $(chartSvgSelector).on('nodeDblClick', (event, data) => {
        //debug && console.log('nodeDblClick:', data);
      });
      $(chartSvgSelector).on('nodeMouseEnter', (event, data) => {
        debug && console.log('UniverseChartView.nodeMouseEnter:', data);
        if (data.chart && data.chart.nodeControls && !data.chart.nodeHandler.inDrag) {
          data.chart.nodeControls.controlNode(data.node);
        } else if (!data.chart.nodeHandler.inDrag) {
          data.chart.highlightNode(data.node)
        }
      });
      $(chartSvgSelector).on('nodeMouseLeave', (event, data) => {
        debug && console.log('UniverseChartView.nodeMouseLeave:', data);
        if (data.chart && data.chart.nodeControls && !data.chart.nodeHandler.inDrag) {
          data.chart.nodeControls.considerDetaching();
        } else if (!data.chart.nodeHandler.inDrag) {
          data.chart.clearHighlight();
        }
      });
      $(chartSvgSelector).on('nodeDragStarted', (event, data) => {
        //debug && console.log('nodeDragStarted:', data);
      });
      $(chartSvgSelector).on('nodeDragEnded', (event, data) => {
        //debug && console.log('nodeDragEnded:', data);
        data.chart.clearHighlight();
      });
      $(chartSvgSelector).on('nodeDropped', (event, data) => {
        debug && console.log('UniverseChartView.nodeDropped:', data);
        data.chart.clearHighlight();
        
        // Make the dropped node a child of the dropped upon node
        let dimensionId  = data.dimension && data.dimension._id,
            parentNodeId = data.dropNode.id || data.dropNode._id,
            childNodeId  = data.dragNode.id || data.dragNode._id,
            childNode    = DataPoints.findOne(childNodeId);
        debug && console.log('UniverseChartView.nodeDropped parent and child:', parentNodeId, childNodeId, dimensionId);
        if (dimensionId && childNode && parentNodeId !== childNodeId) {
          childNode.setDimensionParent(dimensionId, parentNodeId);
        }
      });
      
      // Grab the size of the chart
      let chartWidth  = instance.$(chartSvgSelector).width(),
          chartHeight = instance.$(chartSvgSelector).height();
      
      debug && console.log('UniverseChartView display dimensions:', chartWidth, chartHeight);
      
      // Get the initial data
      let context    = Template.currentData(),
          dimension  = Dimensions.findOne(context.dimensionId),
          dataPoints = DataPoints.find({ dimensionId: context.dimensionId }, { reactive: false });
      
      debug && console.log('UniverseChartView dimension:', context.dimensionId);
      debug && console.log('UniverseChartView data points:', dataPoints.count());
      debug && console.log('UniverseChartView data points:', DataPoints.find({}).count());
      
      // Initialize the chart
      instance.chart = new UniverseChart(chartSvgSelector, context && context.config || {}, true);
      instance.chart.init(chartWidth, chartHeight);
      instance.chart.update(dimension, dataPoints.fetch());
      instance.chart.zoomBounds();
    } else if (!instance.chart) {
      debug && console.log('UniverseChartView waiting for subscriptions to be ready before initializing chart');
    } else {
      debug && console.log('UniverseChartView already initialized, autorun doing nothing');
    }
  });
  
  // Listen for data updates
  instance.autorun(() => {
    let context    = Template.currentData(),
        dimension  = Dimensions.findOne(context.dimensionId),
        dataPoints = DataPoints.find({ dimensionId: context.dimensionId }).fetch();
    if (instance.chart) { // subscriptionsReady removed for local-only adaptation
      debug && console.log('UniverseChartView data points update:', dataPoints.length);
      instance.chart.update(dimension, dataPoints);
      instance.chart.zoomBounds(250);
      
      // Provide for smooth re-framing while the adjustments are handled
      let i;
      for (i = 1; i <= 30; i++) {
        setTimeout(() => {
          instance.chart.zoomBounds(30);
        }, i * 30);
      }
    } else {
      debug && console.log('UniverseChartView data points update deferred:', dataPoints.length);
    }
  });
  
  // Listen for resize events
  instance.autorun(() => {
    let resize      = Session.get('resize');
    if (instance.chart) {
      clearTimeout(instance.resizeTimeout);
      instance.resizeTimeout = setTimeout(() => {
        let chartWidth  = instance.$(chartSvgSelector).width(),
            chartHeight = instance.$(chartSvgSelector).height();
        
        debug && console.log('UniverseChartView resize:', chartWidth, chartHeight);
        
        instance.chart.layout(chartWidth, chartHeight);
        instance.chart.zoomBounds(250);
      }, 100);
    }
  });
});

/**
 * Template Destroyed
 */
Template.UniverseChartView.onDestroyed(() => {
  
});
