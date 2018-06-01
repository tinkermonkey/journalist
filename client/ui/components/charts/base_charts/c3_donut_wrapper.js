import numeral  from 'numeral';
import { Util } from '../../../../../imports/api/util';

let c3         = require('c3'),
    d3         = require('d3'),
    debug      = false,
    trace      = false,
    totalDy    = -0.4,
    nextDy     = 2.0,
    standardDy = 1.2,
    minScale   = 0.75;

export class C3DonutWrapper {
  constructor (containerId, config) {
    debug && console.log(Util.timestamp(), 'C3DonutWrapper creating new chart:', containerId, config);
    
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
    debug && console.log(Util.timestamp(), 'C3DonutWrapper.generate:', this.containerId, data && data.length);
    let self = this;
    
    // Generate the chart
    self.chartConfig = _.extend({
      bindto : '#' + self.containerId,
      data   : self.parseData(data, {
        type   : 'donut',
        onclick: function (d, element) {
          console.log('Default Data Click:', d, element);
        }
      }),
      donut  : {
        title: self.config.title || 'Donut Chart'
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
    if (_.isObject(self.chartConfig.donut.title) || _.isArray(self.chartConfig.donut.title)) {
      self.chartConfig.customTitle = _.clone(self.chartConfig.donut.title);
    } else if (_.isArray(self.chartConfig.donut.title)) {
      self.chartConfig.customTitle = _.clone(self.chartConfig.donut.title);
    } else {
      self.chartConfig.customTitle = [ (self.chartConfig.donut.title || '').toString() ];
    }
    self.chartConfig.donut.title = '';
    
    debug && console.log(Util.timestamp(), 'C3DonutWrapper.generate chartConfig:', self.chartConfig);
    try {
      self.chart = c3.generate(self.chartConfig);
    } catch (e) {
      console.error('C3DonutWrapper.generate failed:', e, self.chartConfig);
    }
    
    self.updateTitle();
    
    if (self.config.callouts.show) {
      self.updateCallouts();
    }
  }
  
  /**
   * Update the chart with new data
   * @param data
   */
  update (data) {
    debug && console.log(Util.timestamp(), 'C3DonutWrapper.update:', this.containerId, data && data.length);
    let self = this;
    
    if (self.chart) {
      try {
        self.chart.load(self.parseData(data));
      } catch (e) {
        console.error('C3DonutWrapper.update failed:', e, data);
      }
      
      self.updateTitle();
      
      if (self.config.callouts.show) {
        self.updateCallouts();
      }
    } else {
      console.error('C3DonutWrapper.update failed because no chart was found');
    }
  }
  
  /**
   * Update the custom title if one exists
   */
  updateTitle () {
    debug && console.log(Util.timestamp(), 'C3DonutWrapper.updateTitle:', this.containerId);
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
      if (self.chartConfig.donut.label && _.isFunction(self.chartConfig.donut.label.format)) {
        total = self.chartConfig.donut.label.format(total, 1);
      }
      
      self.titleElement
          .append('tspan')
          .attr('class', 'donut-total')
          .attr('x', 0)
          .attr('dy', totalDy + 'em')
          .text(total);
      
      self.chartConfig.customTitle.text.forEach((piece, i) => {
        let dy = self.chartConfig.customTitle.showTotal && i === 0 ? nextDy : standardDy;
        self.titleElement
            .append('tspan')
            .attr('class', 'donut-sub-title')
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
            .attr('class', 'donut-title')
            .attr('x', 0)
            .attr('dy', dy + 'em')
            .text(piece);
      });
    }
  }
  
  /**
   * Update the donut slice callouts
   */
  updateCallouts () {
    debug && console.log(Util.timestamp(), 'C3DonutWrapper.updateCallouts:', this.containerId);
    let self        = this,
        svg         = d3.select('#' + self.containerId + ' svg'),
        innerRadius = self.chart.internal.radius,
        outerRadius = self.chart.internal.radiusExpanded + 5;
    
    // Remove the clip path to make the callouts visible if the leave the chart body proper
    svg.select('.c3-chart').attr('clip-path', null);
    
    // Make the overflow for donut charts visible so callouts can be seen
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
    
    let donutSelection = svg.select('.c3-chart-arc')
        .selectAll('.donut-label-group')
        .data(data, (d) => {
          return d.id
        });
    
    // Remove unneeded slices
    donutSelection.exit().remove();
    
    // Add new slices
    let donutEnter = donutSelection.enter()
        .append('g')
        .attr('data-id', (d) => {
          return d.id
        })
        .attr('class', 'donut-label-group');
    
    donutEnter.append('text')
        .attr('class', (d) => {
          return 'donut-label ' + (d.arcMidAngle < Math.PI / 2 ? 'donut-label-left' : 'donut-label-right')
        })
        .attr('dy', '0.35em')
        .text((d) => {
          return d.data && d.data.id
        });
    
    donutEnter.append('polyline')
        .attr('class', 'donut-label-callout');
    
    // Update the selection
    donutSelection = svg.select('.c3-chart-arc').selectAll('.donut-label-group');
    
    // Position and class the labels
    donutSelection.select('.donut-label')
        .attr('class', (d) => {
          return 'donut-label ' + (d.arcMidAngle < Math.PI / 2 ? 'donut-label-left' : 'donut-label-right')
        })
        .attr('transform', (d) => {
          return 'translate(' + _.values(d.labelPos) + ')';
        });
    
    // Draw the callouts
    donutSelection.select('.donut-label-callout')
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
    
    debug && console.log(Util.timestamp(), 'C3DonutWrapper proposed scale:', this.containerId, proposedScale, chartBounds.width, containerWidth);
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
    debug && console.log(Util.timestamp(), 'C3DonutWrapper.parseData:', this.containerId, data && data.length);
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
          console.error('C3DonutWrapper.parseData unknown aggregation:', self.config.aggregation);
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
    
    trace && console.log(Util.timestamp(), 'C3DonutWrapper.parseData complete:', this.containerId, config);
    
    return config
  }
}