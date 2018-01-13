import { numeral } from 'meteor/numeral:numeral';
import { Util } from '../../../../imports/api/util';

let c3 = require('c3'),
  d3 = require('d3'),
  debug = false,
  trace = false,
  totalDy = -0.4,
  nextDy = 2.8,
  standardDy = 1.2;

export class C3DonutWrapper {
  constructor(containerId, config) {
    debug && console.log(Util.timestamp(), 'C3DonutWrapper creating new chart:', containerId, config);

    // Keep track of the container element id
    this.containerId = containerId;

    // Merge the passed config with the default config
    this.config = _.extend({
      aggregation: 'count',
      callouts: {
        show: false,
        align: false
      }
    }, config);

    return this
  }

  /**
   * Generate the chart with some data
   * @param data
   */
  generate(data) {
    debug && console.log(Util.timestamp(), 'C3DonutWrapper.generate:', this.containerId, data && data.length);
    let self = this;

    // Parse the data
    self.parseData(data);

    // Generate the chart
    self.chartConfig = _.extend({
      bindto: '#' + this.containerId,
      data: {
        type: 'donut',
        columns: self.columns
      },
      donut: {
        title: self.config.title || 'Donut Chart'
      },
      legend: {
        show: self.columns.length < 5
      },
      padding: {
        top: 20,
        bottom: 20,
        left: 120,
        right: 120
      }
    }, self.config.chart);

    // check for a custom title
    if (!_.isString(self.chartConfig.donut.title)) {
      debug && console.log(Util.timestamp(), 'C3DonutWrapper custom title:', self.chartConfig.donut.title);
      self.chartConfig.customTitle = _.clone(self.chartConfig.donut.title);
      self.chartConfig.donut.title = '';
    }

    debug && console.log(Util.timestamp(), 'C3DonutWrapper.generate chartConfig:', self.chartConfig);
    self.chart = c3.generate(self.chartConfig);

    if (self.chartConfig.customTitle) {
      self.updateCustomTitle();
    }

    if (self.config.callouts.show) {
      self.updateCallouts();
    }
  }

  /**
   * Update the chart with new data
   * @param data
   */
  update(data) {
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
  updateCustomTitle() {
    debug && console.log(Util.timestamp(), 'C3DonutWrapper.updateCustomTitle:', this.containerId);
    let self = this;

    self.titleElement = d3.select('#' + self.containerId + ' .c3-chart-arcs-title');
    self.titleElement.selectAll('*').remove();

    if (self.chartConfig.customTitle.showTotal) {
      let total = 0;
      if (self.chartConfig.customTitle.totalType && self.chartConfig.customTitle.totalType === 'unique') {
        total = self.columns.length;
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
    }

    self.chartConfig.customTitle.text.forEach((piece, i) => {
      let dy = self.chartConfig.customTitle.showTotal && i === 0 ? nextDy : standardDy;
      self.titleElement
        .append('tspan')
        .attr('x', 0)
        .attr('dy', dy + 'em')
        .text(piece);
    })
  }

  /**
   * Update the donut slice callouts
   */
  updateCallouts() {
    debug && console.log(Util.timestamp(), 'C3DonutWrapper.updateCallouts:', this.containerId);
    let self = this,
      svg = d3.select('#' + self.containerId + ' svg'),
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
        d.labelPos = {
          x: outerRadius * Math.cos(d.arcMidAngle) + (d.arcMidAngle < Math.PI / 2 ? 5 : -5),
          y: outerRadius * Math.sin(d.arcMidAngle)
        };

        if (self.config.callouts.align) {
          d.labelPos.x = (outerRadius + 20) * (d.arcMidAngle < Math.PI / 2 ? 1 : -1);
        }

        d.sweep = Math.abs(d.endAngle - d.startAngle) * innerRadius;
        d.dy = Math.abs(innerRadius * Math.sin(d.startAngle - Math.PI / 2) - innerRadius * Math.sin(d.endAngle - Math.PI / 2));
        data.push(d)
      });

    data = data.filter((d) => { return d.dy > 12 || d.sweep > 20 });

    let donutSelection = svg.select('.c3-chart-arc')
      .selectAll('.donut-label-group')
      .data(data, (d) => { return d.id });

    // Remove unneeded slices
    donutSelection.exit().remove();

    // Add new slices
    let donutEnter = donutSelection.enter()
      .append('g')
      .attr('data-id', (d) => { return d.id })
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

    // Update existing datapoints
    donutSelection.select('.donut-label')
      .attr('class', (d) => {
        return 'donut-label ' + (d.arcMidAngle < Math.PI / 2 ? 'donut-label-left' : 'donut-label-right')
      })
      .attr('transform', (d) => {
        return 'translate(' + _.values(d.labelPos) + ')';
      });

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
  }

  /**
   * Parse the data
   * @param data
   */
  parseData(data) {
    debug && console.log(Util.timestamp(), 'C3DonutWrapper.parseData:', this.containerId, data && data.length);
    let self = this,
      map = {};

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
          console.error('C3DonutWrapper.parseData unknown aggregation:', self.config.aggregation);
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