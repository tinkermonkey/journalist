import numeral  from 'numeral';
import { Util } from '../../../../../imports/api/util';

let c3    = require('c3'),
    d3    = require('d3'),
    debug = false,
    trace = false;

export class C3BarWrapper {
  constructor (containerId, config) {
    debug && console.log(Util.timestamp(), 'C3BarWrapper creating new chart:', containerId, config);
    
    // Keep track of the container element id
    this.containerId = containerId;
    
    // Merge the passed config with the default config
    this.config = _.extend({
      aggregation: 'count',
      attribute  : 'value'
    }, config);
  }
  
  /**
   * Generate the chart with some data
   * @param data
   */
  generate (data) {
    debug && console.log(Util.timestamp(), 'C3BarWrapper.generate:', this.containerId, data && data.length);
    let self = this;
    
    // Generate the chart
    self.chartConfig = _.extend({
      bindto    : '#' + self.containerId,
      data      : {
        type   : 'bar',
        columns: data
      },
      bar       : {
        width: {
          ratio: 0.5 // this makes bar width 50% of length between ticks
        }
      },
      legend    : {
        show: false
      },
      padding   : {
        top   : 20,
        bottom: 20,
        left  : 40,
        right : 20
      },
      transition: {
        duration: 0
      }
    }, self.config.chart);
    
    debug && console.log(Util.timestamp(), 'C3BarWrapper.generate chartConfig:', self.chartConfig);
    self.chart = c3.generate(self.chartConfig);
  }
  
  /**
   * Update the chart with new data
   * @param data
   */
  update (data) {
    debug && console.log(Util.timestamp(), 'C3BarWrapper.update:', this.containerId, data && data.length);
    let self = this;
    
    if (self.chart) {
      self.chart.load({
        columns: data
      });
    } else {
      console.error('C3BarWrapper.update failed because no chart was found');
    }
  }
}