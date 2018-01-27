import { Util } from '../../../../../imports/api/util';
import { Session } from "meteor/session";

let d3    = require('d3'),
    debug = false;

export class D3CapacityPlanSprintHandler {
  /**
   * D3CapacityPlanSprintHandler takes care of constructing and updating the capacity plan sprint representations
   * @param chart
   */
  constructor (chart) {
    this.chart = chart;
  }
  
  /**
   * Update the sprints
   */
  update () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanSprintHandler.update');
    let self  = this,
        chart = this.chart;
    
    self.calculateSprintWidth();
    
    // Service the sprint headers
    self.insertSprintHeaders();
    self.updateSprintHeaders();
    self.removeSprintHeaders();
    
    // Service the sprint backgrounds
    self.insertSprintBackgrounds();
    self.updateSprintBackgrounds();
    self.removeSprintBackgrounds();
    
    // Service the sprint bodies
    self.insertSprintBodies();
    self.updateSprintBodies();
    self.removeSprintBodies();
  }
  
  /**
   * Select all of the existing sprint headers
   */
  updateSprintHeaderSelection () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanSprintHandler.updateSprintHeaderSelection');
    let self  = this,
        chart = this.chart;
    
    self.sprintHeaderSelection = chart.headerLayer.selectAll('.sprint-header-group')
        .data(chart.data.sprints, (d) => {
          return d._id
        })
  }
  
  /**
   * Insert new sprints
   */
  insertSprintHeaders () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanSprintHandler.insertSprintHeaders');
    let self  = this,
        chart = this.chart;
    
    self.updateSprintHeaderSelection();
    
    let sprintHeaderEnter = self.sprintHeaderSelection.enter()
        .append('g')
        .attr('class', 'sprint-header-group')
        .attr('transform', self.sprintBodyTransform.bind(self));
    
    sprintHeaderEnter.append('text')
        .attr('class', 'sprint-header-date')
        .attr('y', 25);
    
    sprintHeaderEnter.append('text')
        .attr('class', 'sprint-header-title')
        .attr('y', 45);
  }
  
  /**
   * Update all sprints
   */
  updateSprintHeaders () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanSprintHandler.updateSprintHeaders');
    let self  = this,
        chart = this.chart;
    
    self.updateSprintHeaderSelection();
    
    chart.headerLayer.attr('transform', 'translate(' + chart.bodyLeft + ',0)');
    
    self.sprintHeaderSelection.attr('transform', self.sprintBodyTransform.bind(self))
        .select('.sprint-header-date')
        .text((sprint) => {
          return moment(sprint.start).format('ddd, MMM Do')
        });
    
    self.sprintHeaderSelection.select('.sprint-header-title')
        .text((sprint) => {
          return sprint.title
        });
  }
  
  /**
   * Remove any unneeded sprints
   */
  removeSprintHeaders () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanSprintHandler.removeSprintHeaders');
    let self  = this,
        chart = this.chart;
    
    self.sprintHeaderSelection.exit().remove();
  }
  
  /**
   * Select all of the existing sprint backgrounds
   */
  updateSprintBackgroundSelection () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanSprintHandler.updateSprintBackgroundSelection');
    let self  = this,
        chart = this.chart;
    
    self.sprintBackgroundSelection = chart.sprintBackgroundLayer.selectAll('.sprint-background-group')
        .data(chart.data.sprints, (d) => {
          return d._id
        });
  }
  
  /**
   * Insert new sprints backgrounds
   */
  insertSprintBackgrounds () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanSprintHandler.insertSprintBackgrounds');
    let self  = this,
        chart = this.chart;
    
    self.updateSprintBackgroundSelection();
    
    let sprintBackgroundEnter = self.sprintBackgroundSelection.enter()
        .append('g')
        .attr('class', 'sprint-background-group')
        .attr('data-sprint-id', (d) => {
          return d._id
        })
        .attr('transform', self.sprintBackgroundTransform.bind(self));
    
    sprintBackgroundEnter.append('rect')
        .attr('class', 'sprint-section sprint-link-section')
        .attr('x', 0)
        .attr('y', 0);
    
    sprintBackgroundEnter.append('rect')
        .attr('class', 'sprint-section sprint-body-section')
        .attr('x', chart.linkSectionWidth)
        .attr('y', 0)
        .on('mouseenter', (d) => {
          let element = d3.select(d3.event.target);
          
          if (Session.get('in-effort-drag')) {
            element.classed('hover', true);
            Session.set('hover-sprint-number', d.sprintNumber);
          }
        })
        .on('mouseleave', (d) => {
          let element = d3.select(d3.event.target);
          element.classed('hover', false);
          
          if (Session.get('in-effort-drag')) {
            Session.set('hover-sprint-number', null);
          }
        });
  }
  
  /**
   * Update all sprints backgrounds
   */
  updateSprintBackgrounds () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanSprintHandler.updateSprintBackgrounds');
    let self  = this,
        chart = this.chart;
    
    self.updateSprintBackgroundSelection();
    
    // Position the background
    self.sprintBackgroundSelection.attr('transform', self.sprintBackgroundTransform.bind(self));
    
    // Size the timelines
    self.sprintBackgroundSelection.selectAll('.sprint-link-section')
        .attr('width', chart.linkSectionWidth)
        .attr('height', Math.max(chart.contributorsHeight, chart.maxSprintHeight || 0));
    
    self.sprintBackgroundSelection.selectAll('.sprint-body-section')
        .attr('width', chart.sprintBodyWidth)
        .attr('height', Math.max(chart.contributorsHeight, chart.maxSprintHeight || 0))
        .attr('x', chart.linkSectionWidth);
  }
  
  /**
   * Remove any unneeded sprints backgrounds
   */
  removeSprintBackgrounds () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanSprintHandler.removeSprintBackgrounds');
    let self  = this,
        chart = this.chart;
    
    self.sprintBackgroundSelection.exit().remove();
  }
  
  /**
   * Select all of the existing sprint bodies
   */
  updateSprintBodySelection () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanSprintHandler.updateSprintBodySelection');
    let self  = this,
        chart = this.chart;
    
    self.sprintBodySelection = chart.sprintBodyLayer.selectAll('.sprint-body-group')
        .data(chart.data.sprints, (d) => {
          return d._id
        })
  }
  
  /**
   * Insert new sprints bodies
   */
  insertSprintBodies () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanSprintHandler.insertSprintBodies');
    let self  = this,
        chart = this.chart;
    
    self.updateSprintBodySelection();
    
    self.sprintBodySelection.enter()
        .append('g')
        .attr('class', 'sprint-body-group')
        .attr('transform', self.sprintBodyTransform.bind(self));
  }
  
  /**
   * Update all sprints bodies
   */
  updateSprintBodies () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanSprintHandler.updateSprintBodies');
    let self  = this,
        chart = this.chart;
    
    self.updateSprintBodySelection();
    
    self.sprintBodySelection.attr('transform', self.sprintBodyTransform.bind(self));
  }
  
  /**
   * Remove any unneeded sprints bodies
   */
  removeSprintBodies () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanSprintHandler.removeSprintBodies');
    let self  = this,
        chart = this.chart;
    
    self.sprintBodySelection.exit().remove();
  }
  
  /**
   * Calculate the width of the sprint blocks
   */
  calculateSprintWidth () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanSprintHandler.calculateSprintWidth');
    let self  = this,
        chart = this.chart;
    
    chart.bodyWidth        = chart.svg.node()
        .getBoundingClientRect().width - chart.config.margin.left - chart.config.margin.right - chart.bodyLeft;
    chart.sprintWidth      = parseInt(Math.min(chart.bodyWidth / chart.data.sprints.length, chart.config.sprints.width));
    chart.sprintBodyWidth  = chart.namesWidth;
    chart.linkSectionWidth = chart.sprintWidth - chart.sprintBodyWidth;
  }
  
  /**
   * Calculate the position of a sprint body section
   * @param sprint
   * @return {string}
   */
  sprintBackgroundTransform (sprint) {
    let chart = this.chart;
    return 'translate(' + (sprint.sprintNumber * chart.sprintWidth) + ',0)'
  }
  
  /**
   * Calculate the position of a sprint body section
   * @param sprint
   * @return {string}
   */
  sprintBodyTransform (sprint) {
    let chart = this.chart;
    return 'translate(' + (sprint.sprintNumber * chart.sprintWidth + chart.linkSectionWidth) + ',0)'
  }
}
