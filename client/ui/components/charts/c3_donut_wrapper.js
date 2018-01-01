import { Util } from '../../../../imports/api/util';

let c3    = require('c3'),
    debug = false,
    trace = false;

export class C3DonutWrapper {
  constructor (containerId, config) {
    debug && console.log(Util.timestamp(), 'C3DonutWrapper creating new chart:', containerId, config);
    
    // Keep track of the container element id
    this.containerId = containerId;
    
    // Merge the passed config with the default config
    this.config = _.extend({
      title      : 'Donut Chart',
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
    let chartConfig = _.extend({
      bindto: '#' + self.containerId,
      data  : {
        type   : 'donut',
        columns: self.columns
      },
      donut : {
        title: self.config.title
      },
      legend: {
        show: self.columns.length < 5
      }
    }, self.config.chart);
    trace && console.log(Util.timestamp(), 'C3DonutWrapper.generate chartConfig:', chartConfig);
    self.chart = c3.generate(chartConfig);
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
    } else {
      console.error('C3DonutWrapper.update failed because no chart was found');
    }
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
      let column = row[ self.config.attribute ] || self.config.countNull ? 'null' : undefined;
      if (column !== undefined) {
        if (!map[ column ]) {
          let title = Util.camelToTitle(column);
          
          if (self.config.renderLabel && _.isFunction(self.config.renderLabel)) {
            title = self.config.renderLabel(column);
          }
          
          map[ column ] = {
            title: title,
            value: 0
          }
        }
        
        if (self.config.aggregation === 'count') {
          map[ column ].value += 1;
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