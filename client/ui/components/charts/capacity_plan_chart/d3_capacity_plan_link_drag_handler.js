import { Util }                   from '../../../../../imports/api/util';
import { CapacityPlanBlockTypes } from '../../../../../imports/api/capacity_plans/capacity_plan_block_types';

let d3     = require('d3'),
    d3Drag = require('d3-drag'),
    debug  = true,
    trace  = false;

export class D3CapacityPlanLinkDragHandler {
  /**
   * Handle the drag behavior for links
   * @param chart
   */
  constructor (chart) {
    let self   = this;
    self.chart = chart;
    
    self.drag = d3Drag.drag()
        .on('start', self.dragStart.bind(self))
        .on('drag', self.dragged.bind(self))
        .on('end', self.dragEnd.bind(self));
  }
  
  /**
   * Handle a link drag starting
   * @param d
   */
  dragStart (d) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkDragHandler.dragStart:', d);
    let self          = this,
        chart         = this.chart,
        dragHandle    = d3.select(d3.event.sourceEvent.target).closest('.link-drag-handle-container'),
        linkContainer = dragHandle.closest('.link-drag-group').select('.link-drag-link-container'),
        dragLink      = linkContainer.append('path').attr('class', 'link-drag-link');
    
    // Freeze out all contributor blocks and effort titles from pointer events
    chart.sprintBackgroundLayer.selectAll('.sprint-background-group').classed('no-mouse', true);
    chart.sprintBodyLayer.selectAll('.release-block-group').classed('no-mouse', true);
    chart.sprintBodyLayer.selectAll('.effort-title').classed('no-mouse', true);
    chart.sprintBodyLayer.selectAll('.contributor-block-group').classed('no-mouse', true);
    
    chart.drag = {
      dragHandle: dragHandle,
      dragLink  : dragLink
    };
    
    chart.drag.dragHandle.classed('in-drag', true);
    chart.inContributorDrag = true;
    
    trace && console.log('D3CapacityPlanLinkDragHandler.dragStart drag:', chart.drag)
  }
  
  /**
   * Handle a link drag moving
   * @param d
   */
  dragged (d) {
    trace && console.log(Util.timestamp(), 'D3CapacityPlanLinkDragHandler.dragged:', d);
    let self  = this,
        chart = this.chart,
        dragX = d3.event.x,
        dragY = d3.event.y;
    
    trace && console.log(Util.timestamp(), 'D3CapacityPlanLinkDragHandler.dragged:', dragX, dragY);
    chart.drag.dragHandle.attr('transform', 'translate(' + dragX + ', ' + dragY + ')');
    
    chart.drag.dragLink.attr('d', chart.linker({ source: [ 0, 0 ], target: [ dragX, dragY ] }))
  }
  
  /**
   * Handle a link drag ending
   * @param d
   */
  dragEnd (d) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkDragHandler.dragEnd:', d);
    let self  = this,
        chart = this.chart;
    
    chart.drag.dragHandle.classed('in-drag', false);
    chart.inContributorDrag = false;
    
    chart.drag.dragLink.remove();
    
    chart.drag.dragHandle
        .transition()
        .duration(250)
        .attr('transform', 'translate(0,0)');
    
    // Un-freeze contributor blocks and effort titles from pointer events
    chart.sprintBackgroundLayer.selectAll('.sprint-background-group').classed('no-mouse', false);
    chart.sprintBodyLayer.selectAll('.release-block-group').classed('no-mouse', false);
    chart.sprintBodyLayer.selectAll('.effort-title').classed('no-mouse', false);
    chart.sprintBodyLayer.selectAll('.contributor-block-group').classed('no-mouse', false);
    
    // Check for a drop
    if (chart.drag.hover) {
      debug && console.log('D3CapacityPlanLinkDragHandler.dragEnd potential drop:', chart.drag.hover);
      chart.drag.hover.element.classed('hover', false);
      
      let contributor = d.blockType === CapacityPlanBlockTypes.contributor ? d.dataRecord() : d;
      debug && console.log('D3CapacityPlanLinkDragHandler.dragEnd dropping a link for contributor:', contributor);
      if (chart.drag.hover.type === CapacityPlanBlockTypes.effort) {
        // Check for an existing block
        let blockCheck = chart.data.option.sprintBlock(chart.drag.hover.record.sprintNumber, contributor._id, chart.drag.hover.record._id);
        if (!blockCheck && (chart.drag.hover.record.sprintNumber > d.sprintNumber || d.sprintNumber === undefined)) {
          // Create a block within the effort for this contributor
          let block = chart.drag.hover.record.addChild(CapacityPlanBlockTypes.contributor, contributor._id, {});
          
          // Create a link
          block.addLink(d._id, d.sprintNumber, CapacityPlanBlockTypes.contributor);
          
          // Heal the links for this contributor
          chart.data.option.healContributorLinks(contributor._id);
        } else {
          console.error('Block already exists:', blockCheck);
        }
      }
    }
    
    delete chart.drag
  }
  
}