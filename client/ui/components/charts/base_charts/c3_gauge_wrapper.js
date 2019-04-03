import numeral  from 'numeral';
import { Util } from '../../../../../imports/api/util';

let c3         = require('c3'),
    d3         = require('d3'),
    debug      = true,
    trace      = false;

export class C3GaugeWrapper {
  constructor (containerId, config) {
    debug && console.log(Util.timestamp(), 'C3GaugeWrapper creating new chart:', containerId, config);
    
    // Keep track of the container element id
    this.containerId = containerId;
    
    // Merge the passed config with the default config
    this.config = _.extend({}, config);
    
    // Keep track of the slices so that filtering can be made to work
    this.scale  = 1.0;
    
    return this
  }
  
  /**
   * Generate the chart with some data
   * @param data
   */
  generate (data) {
    debug && console.log(Util.timestamp(), 'C3GaugeWrapper.generate:', this.containerId, data && data.length);
    let self = this;
    
    // Generate the chart
    self.chartConfig = _.extend({
      bindto : '#' + self.containerId,
      data   : self.parseData(data, {
        type   : 'gauge',
        onclick: function (d, element) {
          console.log('Default Data Click:', d, element);
        }
      }),
      color: {
        pattern  : [ '#FF0000', '#F97600', '#F6C600', '#60B044' ],
        threshold: {
          values: [ 30, 60, 90, 100 ]
        }
      },
      legend : {
        show: false
      },
      padding: {
        top   : 20,
        bottom: 20,
        left  : 20,
        right : 20
      },
      onresize () {
        console.log('chart resize:', this);
      }
    }, self.config.chart);
    
    debug && console.log(Util.timestamp(), 'C3GaugeWrapper.generate chartConfig:', self.chartConfig, self.config);
    try {
      self.chart = c3.generate(self.chartConfig);
      
      if(self.chartConfig.callouts){
        self.generateCallouts(self.chartConfig.callouts);
      }
    } catch (e) {
      console.error('C3GaugeWrapper.generate failed:', e, self.chartConfig);
    }
  }
  
  /**
   * Generate the gauge callouts if they're defined
   */
  generateCallouts (calloutConfig) {
    debug && console.log(Util.timestamp(), 'C3GaugeWrapper.generateCallouts:', this.containerId);
    let self        = this,
        svg         = d3.select('#' + self.containerId + ' svg'),
        innerRadius = self.chart.internal.radius,
        outerRadius = self.chart.internal.radiusExpanded + 5,
        gaugeConfig = self.chart.internal.config,
        calloutRatio = (value) => {
          return (self.chart.internal.x(value) - self.chart.internal.x(self.chart.internal.config.gauge_min)) / (self.chart.internal.x(self.chart.internal.config.gauge_max) - self.chart.internal.x(self.chart.internal.config.gauge_min))
        };
    
    gaugeChart = self.chart;
    
    console.log('C3GaugeWrapper.generateCallouts:', calloutConfig, self.chart);
    console.log('C3GaugeWrapper.generateCallouts chart.axis:', self.chart.x(25));
    console.log('C3GaugeWrapper.generateCallouts chart.internal.axis:', self.chart.internal.x(35));
    
    calloutConfig.forEach((callout) => {
      console.log('Callout:', callout.value, callout.label, calloutRatio(callout.value));
    });
    
    // Remove the clip path to make the callouts visible if the leave the chart body proper
    svg.select('.c3-chart').attr('clip-path', null);
    
    // Make the overflow for gauge charts visible so callouts can be seen
    svg.style('overflow', 'visible');
    svg.selectAll('.c3-event-rect').style('pointer-events', 'none');
    
    return;
    
    // https://bl.ocks.org/mbhall88/b2504f8f3e384de4ff2b9dfa60f325e2
    let data = [];
    svg.selectAll('.c3-chart-arc')
        .each((d) => {
          d.id = d.data.id;
          
          // Calculate some commonly used values
          d.arcMidAngle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;
          d.labelPos    = {
            x: outerRadius * Math.cos(d.arcMidAngle) + (d.arcMidAngle < Math.PI / 2 ? 5 : -5),
            y: outerRadius * Math.sin(d.arcMidAngle)
          };
          
          if (self.config.callouts.align) {
            d.labelPos.x = (outerRadius + 20) * (d.arcMidAngle < Math.PI / 2 ? 1 : -1);
          }
          
          d.sweep = Math.abs(d.endAngle - d.startAngle) * innerRadius;
          d.dy    = Math.abs(innerRadius * Math.sin(d.startAngle - Math.PI / 2) - innerRadius * Math.sin(d.endAngle - Math.PI / 2));
          data.push(d)
        });
    
    data = data.filter((d) => {
      return d.dy > 12 || d.sweep > 45
    });
    
    let gaugeSelection = svg.select('.c3-chart-arc')
        .selectAll('.gauge-label-group')
        .data(data, (d) => {
          return d.id
        });
    
    // Remove unneeded slices
    gaugeSelection.exit().remove();
    
    // Add new slices
    let gaugeEnter = gaugeSelection.enter()
        .append('g')
        .attr('data-id', (d) => {
          return d.id
        })
        .attr('class', 'gauge-label-group');
    
    gaugeEnter.append('text')
        .attr('class', (d) => {
          return 'gauge-label ' + (d.arcMidAngle < Math.PI / 2 ? 'gauge-label-left' : 'gauge-label-right')
        })
        .attr('dy', '0.35em')
        .text((d) => {
          return d.data && d.data.id
        });
    
    gaugeEnter.append('polyline')
        .attr('class', 'gauge-label-callout');
    
    // Update the selection
    gaugeSelection = svg.select('.c3-chart-arc').selectAll('.gauge-label-group');
    
    // Position and class the labels
    gaugeSelection.select('.gauge-label')
        .attr('class', (d) => {
          return 'gauge-label ' + (d.arcMidAngle < Math.PI / 2 ? 'gauge-label-left' : 'gauge-label-right')
        })
        .attr('transform', (d) => {
          return 'translate(' + _.values(d.labelPos) + ')';
        });
    
    // Draw the callouts
    gaugeSelection.select('.gauge-label-callout')
        .attr('points', (d) => {
          return [
            [
              innerRadius * Math.cos(d.arcMidAngle),
              innerRadius * Math.sin(d.arcMidAngle)
            ], [
              outerRadius * Math.cos(d.arcMidAngle),
              outerRadius * Math.sin(d.arcMidAngle)
            ], [
              d.labelPos.x - (d.arcMidAngle < Math.PI / 2 ? 2 : -2),
              d.labelPos.y
            ],
          ]
        });
    
    // Scale the chart display to fit
    let container      = $('#' + self.containerId),
        chartBounds    = container.find('svg').get(0).getBBox(),
        containerWidth = container.width(),
        proposedScale  = Math.max(containerWidth / (chartBounds.width * 0.9), minScale);
    
    // If there's a shared scale, collaborate
    if (self.config.scaleVar) {
      let sharedScale = self.config.scaleVar.get() || 1;
      proposedScale   = Math.min(sharedScale, proposedScale);
      if (proposedScale !== sharedScale) {
        self.config.scaleVar.set(proposedScale);
      }
    }
    
    debug && console.log(Util.timestamp(), 'C3GaugeWrapper proposed scale:', this.containerId, proposedScale, chartBounds.width, containerWidth);
    if (proposedScale < 1) {
      container.closest('.chart').css('transform', 'scale(' + proposedScale + ')')
    }
  }
  
  /**
   * Update the chart with new data
   * @param data
   */
  update (data) {
    debug && console.log(Util.timestamp(), 'C3GaugeWrapper.update:', this.containerId, data && data.length);
    let self = this;
    
    if (self.chart) {
      try {
        self.chart.load(self.parseData(data));
      } catch (e) {
        console.error('C3GaugeWrapper.update failed:', e, data);
      }
    } else {
      console.error('C3GaugeWrapper.update failed because no chart was found');
    }
  }
  
  /**
   * Parse the data
   * @param data
   * @param config
   */
  parseData (data, config) {
    debug && console.log(Util.timestamp(), 'C3GaugeWrapper.parseData:', this.containerId, data && data.length);
    let self = this;
    
    config = config || {};
    
    // Splice in the click handler because this lives on the C3 data construct
    if (self.config.onclick) {
      config.onclick = self.config.onclick.bind(self);
    }
    
    config.columns = [ data ];
    
    // Backwards compatibility
    self.columns = config.columns;
    
    trace && console.log(Util.timestamp(), 'C3GaugeWrapper.parseData complete:', this.containerId, config);
    
    return config
  }
}