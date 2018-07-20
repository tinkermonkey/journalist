import numeral  from 'numeral';
import { Util } from '../../../../../imports/api/util';

let c3         = require('c3'),
    d3         = require('d3'),
    debug      = true,
    trace      = false,
    totalDy    = -0.4,
    nextDy     = 2.0,
    standardDy = 1.2,
    minScale   = 0.75;

export class C3GaugeWrapper {
  constructor (containerId, config) {
    debug && console.log(Util.timestamp(), 'C3GaugeWrapper creating new chart:', containerId, config);
    
    // Keep track of the container element id
    this.containerId = containerId;
    
    // Merge the passed config with the default config
    this.config = _.extend({
      aggregation: 'count',
      callouts   : {
        show : false,
        align: false
      }
    }, config);
    
    // Keep track of the slices so that filtering can be made to work
    this.slices = [];
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
      gauge  : {
        title: self.config.title || 'Gauge Chart',
        color: {
          pattern: ['#FF0000', '#F97600', '#F6C600', '#60B044'], // the three color levels for the percentage values.
          threshold: {
//            unit: 'value', // percentage is default
//            max: 200, // 100 is default
            values: [30, 60, 90, 100]
          }
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
    
    // Handle the title
    if (_.isObject(self.chartConfig.gauge.title) || _.isArray(self.chartConfig.gauge.title)) {
      self.chartConfig.customTitle = _.clone(self.chartConfig.gauge.title);
    } else if (_.isArray(self.chartConfig.gauge.title)) {
      self.chartConfig.customTitle = _.clone(self.chartConfig.gauge.title);
    } else {
      self.chartConfig.customTitle = [ (self.chartConfig.gauge.title || '').toString() ];
    }
    self.chartConfig.gauge.title = '';
    
    debug && console.log(Util.timestamp(), 'C3GaugeWrapper.generate chartConfig:', self.chartConfig);
    try {
      self.chart = c3.generate(self.chartConfig);
    } catch (e) {
      console.error('C3GaugeWrapper.generate failed:', e, self.chartConfig);
    }
    
    //self.updateTitle();
    
    if (self.config.callouts.show) {
      //self.updateCallouts();
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
        //self.chart.load(self.parseData(data));
      } catch (e) {
        console.error('C3GaugeWrapper.update failed:', e, data);
      }
      
      //self.updateTitle();
      
      if (self.config.callouts.show) {
        //self.updateCallouts();
      }
    } else {
      console.error('C3GaugeWrapper.update failed because no chart was found');
    }
  }
  
  /**
   * Update the custom title if one exists
   */
  updateTitle () {
    debug && console.log(Util.timestamp(), 'C3GaugeWrapper.updateTitle:', this.containerId);
    let self = this;
    
    self.titleElement = d3.select('#' + self.containerId + ' .c3-chart-arcs-title');
    self.titleElement.selectAll('*').remove();
    
    if (self.chartConfig.customTitle.showTotal) {
      let total = 0;
      if (self.chartConfig.customTitle.totalType && self.chartConfig.customTitle.totalType === 'unique') {
        // Only count visible columns
        total = self.columns.filter((column) => {
          return column.length > 1 && column[ 1 ] > 0
        }).length;
      } else {
        total = _.flatten(self.columns).reduce((acc, val) => {
          return (_.isNumber(val) ? val : 0) + acc
        }, 0);
      }
      
      // Format the total if needed
      if (self.chartConfig.gauge.label && _.isFunction(self.chartConfig.gauge.label.format)) {
        total = self.chartConfig.gauge.label.format(total, 1);
      }
      
      self.titleElement
          .append('tspan')
          .attr('class', 'gauge-total')
          .attr('x', 0)
          .attr('dy', totalDy + 'em')
          .text(total);
      
      self.chartConfig.customTitle.text.forEach((piece, i) => {
        let dy = self.chartConfig.customTitle.showTotal && i === 0 ? nextDy : standardDy;
        self.titleElement
            .append('tspan')
            .attr('class', 'gauge-sub-title')
            .attr('x', 0)
            .attr('dy', dy + 'em')
            .text(piece);
      });
    } else {
      let pieces = _.isArray(self.chartConfig.customTitle) ? self.chartConfig.customTitle : self.chartConfig.customTitle.text;
      pieces.forEach((piece, i) => {
        let dy = i === 0 ? (-1 * (pieces.length - 1) * standardDy) / 2 : standardDy;
        self.titleElement
            .append('tspan')
            .attr('class', 'gauge-title')
            .attr('x', 0)
            .attr('dy', dy + 'em')
            .text(piece);
      });
    }
  }
  
  /**
   * Update the gauge slice callouts
   */
  updateCallouts () {
    debug && console.log(Util.timestamp(), 'C3GaugeWrapper.updateCallouts:', this.containerId);
    let self        = this,
        svg         = d3.select('#' + self.containerId + ' svg'),
        innerRadius = self.chart.internal.radius,
        outerRadius = self.chart.internal.radiusExpanded + 5;
    
    // Remove the clip path to make the callouts visible if the leave the chart body proper
    svg.select('.c3-chart').attr('clip-path', null);
    
    // Make the overflow for gauge charts visible so callouts can be seen
    svg.style('overflow', 'visible');
    svg.selectAll('.c3-event-rect').style('pointer-events', 'none');
    
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
   * Parse the data
   * @param data
   * @param config
   */
  parseData (data, config) {
    debug && console.log(Util.timestamp(), 'C3GaugeWrapper.parseData:', this.containerId, data && data.length);
    let self = this,
        map  = {};
    
    config = config || {};
    
    // Splice in the click handler because this lives on the C3 data construct
    if (self.config.onclick) {
      config.onclick = self.config.onclick.bind(self);
    }
    data.forEach((row) => {
      let columnKey;
      
      // If an attribute to pick the data key from is defined, use it
      if (_.isObject(row)) {
        if (self.config.keyAttribute) {
          columnKey = row[ self.config.keyAttribute ]
        } else {
          columnKey = row[ self.config.valueAttribute ]
        }
      } else {
        columnKey = row;
      }
      
      if (columnKey === undefined && self.config.countNull === true || _.isString(columnKey) && columnKey.length === 0) {
        columnKey = 'null';
      }
      
      if (columnKey !== undefined) {
        if (!map[ columnKey ]) {
          let title = self.config.renderLabel && _.isFunction(self.config.renderLabel) ? self.config.renderLabel(columnKey) : Util.camelToTitle(columnKey);
          
          map[ columnKey ] = {
            title: title || 'None',
            value: 0
          }
        }
        
        if (self.config.aggregation === 'count') {
          map[ columnKey ].value += 1;
        } else if (self.config.aggregation === 'sum') {
          map[ columnKey ].value += row[ self.config.valueAttribute ];
        } else {
          console.error('C3GaugeWrapper.parseData unknown aggregation:', self.config.aggregation);
        }
      }
    });
    
    // Format it into columns
    config.columns = [];
    _.keys(map).forEach((columnKey) => {
      let column = map[ columnKey ];
      config.columns.push([ column.title, column.value ]);
      
      if (!_.contains(self.slices, column.title)) {
        self.slices.push(column.title)
      }
    });
    
    // Scan for slices that are no longer in the data
    let missingSlices = _.difference(self.slices, config.columns.map((column) => {
      return column[ 0 ]
    }));
    missingSlices.forEach((slice) => {
      config.columns.push([ slice, 0 ]);
    });
    
    // Backwards compatibility
    self.columns = config.columns;
    
    trace && console.log(Util.timestamp(), 'C3GaugeWrapper.parseData complete:', this.containerId, config);
    
    return config
  }
}