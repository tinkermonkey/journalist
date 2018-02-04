import { Session }                  from 'meteor/session';
import { Util }                     from '../../../../../imports/api/util';
import { CapacityPlanBlockTypes }   from '../../../../../imports/api/capacity_plans/capacity_plan_block_types';
import { CapacityPlanSprintBlocks } from '../../../../../imports/api/capacity_plans/capacity_plan_sprint_blocks';

let d3     = require('d3'),
    d3Drag = require('d3-drag'),
    debug  = false,
    trace  = false;

export class D3CapacityPlanEffortListHandler {
  constructor (chart) {
    let self = this;
    
    self.chart = chart;
    
    // The list starts invisible
    self.effortListVisible = false;
    
    // Create the drag behavior for the efforts
    self.effortDrag = d3Drag.drag()
        .on('start', self.effortDragStart.bind(self))
        .on('drag', self.effortDragged.bind(self))
        .on('end', self.effortDragEnd.bind(self));
  }
  
  /**
   * Update the effort list
   */
  update () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanEffortListHandler.update');
    let self  = this,
        chart = this.chart;
    
    self.calculateBlockSizes();
    
    // Service the effort list
    self.insertEffortListItems();
    self.updateEffortListItems();
    self.removeEffortListItems();
  }
  
  /**
   * Select all of the efforts in the effort list
   */
  updateEffortBlockSelection () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanEffortListHandler.updateEffortBlockSelection');
    let self  = this,
        chart = this.chart;
    
    self.effortBlockSelection = chart.effortListLayer.select('.effort-list-foreground').selectAll('.effort-block-group')
        .data(chart.data.efforts, (d) => {
          return d._id
        });
  }
  
  /**
   * Insert newly added efforts to the effort list
   */
  insertEffortListItems () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanEffortListHandler.insertEffortListItems');
    let self  = this,
        chart = this.chart;
    
    self.updateEffortBlockSelection();
    
    let effortBlockEnter = self.effortBlockSelection.enter()
        .append('g')
        .attr('class', 'effort-block-group')
        .attr('transform', self.positionEffortBlock.bind(self))
        .attr('data-block-id', (d) => {
          return d._id
        })
        .attr('data-effort-id', (d) => {
          return d.dataId
        })
        .call(self.effortDrag);
    
    effortBlockEnter.append('rect')
        .attr('class', 'effort-block')
        .attr('x', 0)
        .attr('y', 0)
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('width', chart.sprintBodyWidth)
        .on('mouseenter', (d) => {
          let element = d3.select(d3.event.target);
          element.classed('hover', true);
        })
        .on('mouseleave', (d) => {
          let element = d3.select(d3.event.target);
          element.classed('hover', false);
        });
    
    effortBlockEnter.append('text')
        .attr('class', 'effort-title')
        .attr('x', chart.config.efforts.padding)
        .attr('y', chart.config.contributors.height);
  }
  
  /**
   * Update all of the efforts in the effort list
   */
  updateEffortListItems () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanEffortListHandler.updateEffortListItems');
    let self  = this,
        chart = this.chart;
    
    self.updateEffortBlockSelection();
    
    // Reposition and size the effort block groups
    self.effortBlockSelection.select('.effort-block')
        .attr('height', (d) => {
          return d.height
        })
        .attr('width', chart.sprintBodyWidth)
        .style('fill', (d) => {
          return d.color
        });
    
    // Update the effort title
    self.effortBlockSelection.select('.effort-title')
        .text((d) => {
          return d.title
        })
        .call(Util.wrapSvgText, d3, chart.sprintBodyWidth - (2 * chart.config.efforts.padding));
    
    // Move the body to fit the title
    self.effortBlockSelection.select('.effort-block-body')
        .attr('transform', (d) => {
          return 'translate(0, ' + d.height + ')'
        });
    
    // Animate the repositioning
    self.effortBlockSelection.transition()
        .duration(500)
        .on('end', () => {
        })
        .attr('transform', self.positionEffortBlock.bind(self));
    
  }
  
  /**
   * Remove any unneeded efforts from the effort list
   */
  removeEffortListItems () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanEffortListHandler.removeEffortListItems');
    let self  = this,
        chart = this.chart;
    
    self.effortBlockSelection.exit().remove();
  }
  
  /**
   * Size the effort blocks
   */
  calculateBlockSizes () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanEffortListHandler.calculateBlockSizes');
    let self  = this,
        chart = this.chart;
    
    // Size all of the blocks
    let dy = chart.config.efforts.margin;
    chart.data.efforts.forEach((effort) => {
      // Size the title so the height can be accurate
      let titleTemp = chart.offscreenLayer.append('text')
          .attr('class', 'effort-title')
          .attr('data-effort-id', effort._id)
          .text(effort.title);
      
      titleTemp.call(Util.wrapSvgText, d3, chart.sprintBodyWidth - (2 * chart.config.efforts.padding));
      
      let lineCount = chart.offscreenLayer.select('.effort-title[data-effort-id="' + effort._id + '"]').selectAll('tspan')
          .nodes().length;
      
      if (lineCount > 1) {
        effort.height = (chart.config.contributors.height * 1.0) * lineCount + chart.config.efforts.padding;
      } else {
        effort.height = chart.config.efforts.padding * 2 + chart.config.contributors.height;
      }
      
      // Position the block
      effort.y = dy;
      dy += effort.height + chart.config.efforts.margin;
    });
    
    chart.effortListHeight = dy;
    
  }
  
  /**
   * Positions the efforts in the effort list
   * @param block
   */
  positionEffortBlock (block) {
    let chart = this.chart;
    return 'translate(' + chart.config.efforts.margin + ', ' + block.y + ')'
  }
  
  /**
   * Toggle display of the effort list
   */
  toggleEffortList () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanEffortListHandler.toggleEffortList');
    let self  = this,
        chart = this.chart;
    
    self.effortListVisible = !self.effortListVisible;
    
    if (self.effortListVisible) {
      // Attach the clip path to the foreground
      chart.effortListForeground.attr('clip-path', 'url(#' + chart.effortListClipPathId + ')');
      
      // Show the background
      chart.effortListBackground
          .attr('width', chart.sprintBodyWidth + 2 * chart.config.efforts.margin)
          .attr('height', 2 * chart.config.efforts.margin)
          .classed('effort-list-hide', false)
          .transition()
          .duration(250)
          .attr('height', chart.effortListHeight);
      
      // Animate resizing of the mask
      chart.effortListClipPath.select('rect')
          .attr('width', chart.sprintBodyWidth + 2 * chart.config.efforts.margin)
          .transition()
          .duration(250)
          .attr('height', chart.effortListHeight)
          .on('end', () => {
            chart.effortListForeground.attr('clip-path', null);
          });
      
      // Resize the chart to fit this if needed
      let neededHeight = 4 * chart.config.efforts.margin + chart.config.header.height + chart.effortListHeight;
      if (neededHeight > chart.height) {
        chart.restoreHeight = chart.height;
        chart.svg.transition()
            .duration(250)
            .style('height', neededHeight + 'px');
        
        chart.innerShadowBottom
            .transition()
            .duration(250)
            .attr('y', neededHeight - chart.config.shadow.height);
      }
    } else {
      // Attach the clip path to the foreground
      chart.effortListForeground.attr('clip-path', 'url(#' + chart.effortListClipPathId + ')');
      
      // Hide the background
      chart.effortListBackground
          .transition()
          .duration(250)
          .attr('height', 2 * chart.config.efforts.margin)
          .on('end', () => {
            chart.effortListBackground.classed('effort-list-hide', true)
          });
      
      // Animate the clip path
      chart.effortListClipPath.select('rect')
          .transition()
          .duration(250)
          .attr('height', 0);
      
      // Restore the chart height if it was adjusted
      if (chart.restoreHeight) {
        chart.svg.transition()
            .duration(250)
            .style('height', chart.height + 'px');
        chart.innerShadowBottom
            .transition()
            .duration(250)
            .attr('y', chart.height - chart.config.shadow.height);
        delete chart.restoreHeight;
      }
    }
  }
  
  /**
   * Handle a link drag starting
   * @param effort
   */
  effortDragStart (effort) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanEffortListHandler.dragStart:', effort);
    let self        = this,
        chart       = this.chart,
        dragElement = d3.select(d3.event.sourceEvent.target).closest('.effort-block-group');
    
    Session.set('in-effort-drag', true);
    
    // Freeze out all contributor blocks and effort titles from pointer events
    chart.sprintBodyLayer.selectAll('.effort-block-group').classed('no-mouse', true);
    chart.sprintBodyLayer.selectAll('.contributor-block-group').classed('no-mouse', true);
    
    chart.drag = {
      dragElement: dragElement,
      offsetX    : d3.event.x - chart.config.efforts.margin,
      offsetY    : 0
    };
    
    chart.drag.dragElement.classed('no-mouse', true);
    
    trace && console.log('D3CapacityPlanEffortListHandler.dragStart drag:', d3.event, chart.drag)
  }
  
  /**
   * Handle a link drag moving
   * @param effort
   */
  effortDragged (effort) {
    //trace && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.dragged:', effort);
    let self  = this,
        chart = this.chart,
        dragX = d3.event.x - chart.drag.offsetX,
        dragY = d3.event.y - chart.drag.offsetY;
    
    trace && console.log(Util.timestamp(), 'D3CapacityPlanEffortListHandler.dragged:', dragX, dragY);
    chart.drag.dragElement.attr('transform', 'translate(' + dragX + ', ' + dragY + ')');
  }
  
  /**
   * Handle a link drag ending
   * @param effort
   */
  effortDragEnd (effort) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanEffortListHandler.dragEnd:', effort);
    let self         = this,
        chart        = this.chart,
        sprintNumber = Session.get('hover-sprint-number');
    
    chart.drag.dragElement.classed('no-mouse', false);
    Session.set('in-effort-drag', false);
    
    chart.drag.dragElement
        .transition()
        .duration(250)
        .attr('transform', self.positionEffortBlock(effort));
    
    // Un-freeze contributor blocks and effort titles from pointer events
    chart.sprintBodyLayer.selectAll('.effort-block-group').classed('no-mouse', false);
    chart.sprintBodyLayer.selectAll('.contributor-block-group').classed('no-mouse', false);
    
    if (_.isNumber(sprintNumber)) {
      let sprintBlockCount = chart.data.option.sprintBlocks(sprintNumber, CapacityPlanBlockTypes.effort).count(),
          existingBlock    = chart.data.option.sprintBlock(sprintNumber, effort._id);
      
      // Make sure that this doesn't already exist in this sprint
      if (!existingBlock) {
        CapacityPlanSprintBlocks.insert({
          planId      : chart.data.option.planId,
          optionId    : chart.data.option._id,
          sprintNumber: sprintNumber,
          order       : sprintBlockCount,
          blockType   : CapacityPlanBlockTypes.effort,
          dataId      : effort._id,
          chartData   : {}
        });
        
        // heal any release links for this option in case this effort affects the release
        chart.data.option.healReleaseLinks(effort._id);
      } else {
        console.error('Sprint', sprintNumber, 'already has a block for the effort', effort.title, effort._id);
      }
      
      Session.set('hover-sprint-number', null);
    }
    
    delete chart.drag
  }
  
}