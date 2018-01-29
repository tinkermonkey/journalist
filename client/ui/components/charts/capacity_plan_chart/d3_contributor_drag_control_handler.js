import { Util } from '../../../../../imports/api/util';

let debug = false;

export class D3ContributorDragControlHandler {
  constructor (chart, parent) {
    this.chart  = chart;
    this.parent = parent;
  }
  
  /**
   * Insert controls for any
   * @param selection
   */
  insert (selection) {
    debug && console.log(Util.timestamp(), 'D3ContributorDragControlHandler.insert');
    let self  = this,
        chart = this.chart;
    
    // Create the drag handle
    let dragGroupEnter = selection.append('g')
        .attr('class', 'link-drag-group')
        .attr('data-source-id', (d) => {
          return d._id
        });
    
    dragGroupEnter.append('g')
        .attr('class', 'link-drag-link-container');
    
    let dragContainerEnter = dragGroupEnter.append('g')
        .attr('class', 'link-drag-handle-container')
        .call(chart.linkDragHandler.drag);
    
    dragContainerEnter.append('circle')
        .attr('class', 'link-drag-handle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 7);
    
    dragContainerEnter.append('circle')
        .attr('class', 'link-drag-handle-dot')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 2);
  }
}