import { numeral } from 'meteor/numeral:numeral';
import { Util } from '../../../../imports/api/util';

let c3         = require('c3'),
    d3         = require('d3'),
    debug      = false,
    trace      = false,
    totalDy    = -0.4,
    nextDy     = 2.8,
    standardDy = 1.2;

export class C3DonutWrapper {
  constructor (containerId, config) {
    debug && console.log(Util.timestamp(), 'C3DonutWrapper creating new chart:', containerId, config);
    
    // Keep track of the container element id
    this.containerId = containerId;
    
    // Merge the passed config with the default config
    this.config = _.extend({
      chart      : {
        title: 'Donut Chart',
      },
      aggregation: 'count',
      attribute  : 'value'
    }, config);
  }
  
  /**
   * Generate the chart with some data
   * @param data
   */
  generate (data) {
    debug && console.log(Util.timestamp(), 'C3DonutWrapper.generate:', this.containerId, data && data.length);
    let self = this;
    
    // Parse the data
    self.parseData(data);
    
    // Generate the chart
    self.chartConfig = _.extend({
      bindto: '#' + self.containerId,
      data  : {
        type   : 'donut',
        columns: self.columns
      },
      donut : {
        title: 'Donut!'
      },
      legend: {
        show: self.columns.length < 5
      }
    }, self.config.chart);
    
    // check for a custom title
    if (!_.isString(self.chartConfig.donut.title)) {
      debug && console.log('C3DonutWrapper custom title:', chartConfig.donut.title);
      self.chartConfig.customTitle = _.clone(self.chartConfig.donut.title);
      self.chartConfig.donut.title = '';
    }
    
    debug && console.log(Util.timestamp(), 'C3DonutWrapper.generate chartConfig:', self.chartConfig);
    self.chart = c3.generate(self.chartConfig);
    
    if (self.chartConfig.customTitle) {
      self.updateCustomTitle();
    }
  }
  
  /**
   * Update the chart with new data
   * @param data
   */
  update (data) {
    debug && console.log(Util.timestamp(), 'C3DonutWrapper.update:', this.containerId, data && data.length);
    let self = this;
    
    // Parse the data
    self.parseData(data);
    
    if (self.chart) {
      self.chart.load({
        columns: self.columns
      });
      
      if (self.chartConfig.customTitle) {
        self.updateCustomTitle();
      }
    } else {
      console.error('C3DonutWrapper.update failed because no chart was found');
    }
  }
  
  updateCustomTitle () {
    debug && console.log(Util.timestamp(), 'C3DonutWrapper.update:', this.containerId, data && data.length);
    let self = this;
    
    self.titleElement = d3.select('#' + self.containerId + ' .c3-chart-arcs-title');
    self.titleElement.selectAll('*').remove();
    
    if (self.chartConfig.customTitle.showTotal) {
      let total = _.flatten(self.columns).reduce((acc, val) => {
        return (_.isNumber(val) ? val : 0) + acc
      }, 0);
      
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
    }
    
    self.chartConfig.customTitle.text.forEach((piece, i) => {
      let dy = self.chartConfig.customTitle.showTotal && i === 0 ? nextDy : i * standardDy;
      self.titleElement
          .append('tspan')
          .attr('x', 0)
          .attr('dy', dy + 'em')
          .text(piece);
    })
  }
  
  /**
   * Parse the data
   * @param data
   */
  parseData (data) {
    debug && console.log(Util.timestamp(), 'C3DonutWrapper.parseData:', this.containerId, data && data.length);
    let self = this,
        map  = {};
    
    // Aggregate the data
    data.forEach((row) => {
      let columnKey;
      
      // If an attribute to pick the data key from is defined, use it
      if (self.config.keyAttribute) {
        columnKey = row[ self.config.keyAttribute ]
      } else {
        columnKey = row[ self.config.valueAttribute ]
      }
      
      if (columnKey === undefined && self.config.countNull === true || _.isString(columnKey) && columnKey.length === 0) {
        columnKey = 'null';
      }
      
      if (columnKey !== undefined) {
        if (!map[ columnKey ]) {
          let title = self.config.renderLabel && _.isFunction(self.config.renderLabel) ? self.config.renderLabel(columnKey) : Util.camelToTitle(columnKey);
          
          map[ columnKey ] = {
            title: title,
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
    self.columns = [];
    _.keys(map).forEach((columnKey) => {
      let column = map[ columnKey ];
      self.columns.push([ column.title, column.value ]);
    });
  }
}