import { Util } from '../../../../../imports/api/util';

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
    let self      = this,
        chart     = this.chart,
        startTime = Date.now();
    
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
    
    chart.debug() && console.log(Util.timestamp(), 'D3CapacityPlanSprintHandler.update complete:', Date.now() - startTime);
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
        .attr('class', 'sprint-header-title')
        .style('font-size', parseInt(chart.config.header.height * 0.75) + 'px')
        .attr('y', 0);
    
    sprintHeaderEnter.append('text')
        .attr('class', 'sprint-header-date')
        .attr('y', chart.config.header.height - 5);
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
          return moment(sprint.startDate).format('ddd, MMM Do')
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
        .attr('data-sprint-number', (d) => {
          return d.sprintNumber
        })
        .attr('transform', self.sprintBackgroundTransform.bind(self));
    
    sprintBackgroundEnter.append('rect')
        .attr('class', 'sprint-section sprint-link-section')
        .attr('x', 0)
        .attr('y', 0);
    
    sprintBackgroundEnter.append('rect')
        .attr('class', 'sprint-section sprint-body-section')
        .attr('x', chart.linkSectionWidth - chart.config.sprints.padding)
        .attr('y', 0)
        .on('mouseenter', (sprint) => {
          let element = d3.select(d3.event.target);
          
          element.closest('.sprint-background-group').classed('hover', true);
          if (chart.inEffortDrag) {
            chart.drag.hover = {
              type   : 'sprint',
              record : sprint,
              element: element
            };
          }
        })
        .on('mouseleave', (d) => {
          let element = d3.select(d3.event.target);
          element.closest('.sprint-background-group').classed('hover', false);
          
          if (chart.inEffortDrag) {
            delete chart.drag.hover;
            
            // Reset the sprint block positions
            chart.blockHandler.resetBlocksInSprint(d.sprintNumber);
          }
        });
    
    sprintBackgroundEnter.append('line')
        .attr('class', 'sprint-background-border sprint-background-border-left')
        .attr('x1', chart.linkSectionWidth - chart.config.sprints.padding)
        .attr('y1', 0)
        .attr('x2', chart.linkSectionWidth - chart.config.sprints.padding)
        .attr('y2', chart.maxContentHeight());
    
    sprintBackgroundEnter.append('line')
        .attr('class', 'sprint-background-border sprint-background-border-right')
        .attr('x1', chart.sprintWidth + chart.config.sprints.padding)
        .attr('y1', 0)
        .attr('x2', chart.sprintWidth + chart.config.sprints.padding)
        .attr('y2', chart.maxContentHeight());
    
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
        .attr('width', chart.linkSectionWidth - chart.config.sprints.padding)
        .attr('height', chart.maxContentHeight());
    
    self.sprintBackgroundSelection.selectAll('.sprint-body-section')
        .attr('x', chart.linkSectionWidth - chart.config.sprints.padding)
        .attr('width', chart.sprintBodyWidth + chart.config.sprints.padding * 2)
        .attr('height', chart.maxContentHeight());
    
    self.sprintBackgroundSelection.selectAll('.sprint-background-border-left')
        .attr('x1', chart.linkSectionWidth - chart.config.sprints.padding)
        .attr('x2', chart.linkSectionWidth - chart.config.sprints.padding)
        .attr('y2', chart.maxContentHeight());
    
    self.sprintBackgroundSelection.selectAll('.sprint-background-border-right')
        .attr('x1', chart.sprintWidth + chart.config.sprints.padding)
        .attr('x2', chart.sprintWidth + chart.config.sprints.padding)
        .attr('y2', chart.maxContentHeight());
    
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
    
    // Calculate an unscaled sizing
    chart.unscaled                  = {};
    chart.unscaled.bodyWidth        = chart.svg.node()
        .getBoundingClientRect().width - chart.config.margin.left - chart.config.margin.right - chart.config.sprints.padding - chart.bodyLeft;
    chart.unscaled.sprintWidth      = parseInt(chart.unscaled.bodyWidth / (chart.data.sprints.length + 0.2));
    chart.unscaled.sprintBodyWidth  = parseInt(chart.unscaled.sprintWidth * 0.75);
    chart.unscaled.linkSectionWidth = chart.unscaled.sprintWidth - chart.unscaled.sprintBodyWidth;
    
    // Calculate the proposed scale
    chart.proposedScale = Math.max(Math.min(chart.unscaled.linkSectionWidth / (chart.config.releases.width * 2), 1), chart.config.minScale);
    debug && console.log('D3CapacityPlanSprintHandler.calculateSprintWidth unscaled:', chart.data.sprints.length, chart.unscaled, chart.proposedScale);
    
    // Calculate the size based on the current scale
    chart.bodyWidth        = (chart.scaleClientRect(chart.svg.node().getBoundingClientRect()).width) -
        chart.config.margin.left - chart.config.margin.right - chart.config.sprints.padding - chart.bodyLeft;
    chart.sprintWidth      = parseInt(chart.bodyWidth / (chart.data.sprints.length + 0.2));
    chart.sprintBodyWidth  = parseInt(chart.sprintWidth * 0.75);
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
