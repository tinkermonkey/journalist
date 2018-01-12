import { numeral } from 'meteor/numeral:numeral';
import { Util } from '../../../../imports/api/util';

let c3 = require('c3'),
  d3 = require('d3'),
  debug = false,
  trace = false,
  totalDy = -0.4,
  nextDy = 2.8,
  standardDy = 1.2;

export class C3BarWrapper {
  constructor(containerId, config) {
    debug && console.log(Util.timestamp(), 'C3BarWrapper creating new chart:', containerId, config);

    // Keep track of the container element id
    this.containerId = containerId;

    // Merge the passed config with the default config
    this.config = _.extend({
      aggregation: 'count',
      attribute: 'value'
    }, config);
  }

  /**
   * Generate the chart with some data
   * @param data
   */
  generate(data) {
    debug && console.log(Util.timestamp(), 'C3BarWrapper.generate:', this.containerId, data && data.length);
    let self = this;

    // Parse the data
    self.parseData(data);

    // Generate the chart
    self.chartConfig = _.extend({
      bindto: '#' + this.containerId,
      data: {
        type: 'bar',
        columns: self.columns
      },
      bar: {
        width: {
          ratio: 0.5 // this makes bar width 50% of length between ticks
        }
      },
      legend: {
        show: self.columns.length < 4
      }
    }, self.config.chart);

    debug && console.log(Util.timestamp(), 'C3BarWrapper.generate chartConfig:', self.chartConfig);
    self.chart = c3.generate(self.chartConfig);

    if (self.chartConfig.customTitle) {
      self.updateCustomTitle();
    }
  }

  /**
   * Update the chart with new data
   * @param data
   */
  update(data) {
    debug && console.log(Util.timestamp(), 'C3BarWrapper.update:', this.containerId, data && data.length);
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
      console.error('C3BarWrapper.update failed because no chart was found');
    }
  }

  /**
   * Parse the data
   * @param data
   */
  parseData(data) {
    debug && console.log(Util.timestamp(), 'C3BarWrapper.parseData:', this.containerId, data && data.length);
    let self = this,
      map = {};

    //console.log(Util.timestamp(), 'C3BarWrapper.parseData:', data);
    self.columns = [data];
    return

    // Aggregate the data
    data.forEach((row) => {
      let columnKey;

      // If an attribute to pick the data key from is defined, use it
      if (_.isObject(row)) {
        if (self.config.keyAttribute) {
          columnKey = row[self.config.keyAttribute]
        } else {
          columnKey = row[self.config.valueAttribute]
        }
      } else {
        columnKey = row;
      }

      if (columnKey === undefined && self.config.countNull === true || _.isString(columnKey) && columnKey.length === 0) {
        columnKey = 'null';
      }

      if (columnKey !== undefined) {
        if (!map[columnKey]) {
          let title = self.config.renderLabel && _.isFunction(self.config.renderLabel) ? self.config.renderLabel(columnKey) : Util.camelToTitle(columnKey);

          map[columnKey] = {
            title: title,
            value: 0
          }
        }

        if (self.config.aggregation === 'count') {
          map[columnKey].value += 1;
        } else if (self.config.aggregation === 'sum') {
          map[columnKey].value += row[self.config.valueAttribute];
        } else {
          console.error('C3BarWrapper.parseData unknown aggregation:', self.config.aggregation);
        }
      }
    });

    // Format it into columns
    self.columns = [];
    _.keys(map).forEach((columnKey) => {
      let column = map[columnKey];
      self.columns.push([column.title, column.value]);
    });
  }
}