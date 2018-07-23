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
        pattern  : [ '#FF0000', '#F97600', '#F6C600', '#60B044' ], // the three color levels for the percentage values.
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
    } catch (e) {
      console.error('C3GaugeWrapper.generate failed:', e, self.chartConfig);
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