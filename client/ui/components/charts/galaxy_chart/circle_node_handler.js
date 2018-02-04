'use strict';

/**
 * CircleNodeHandler
 *
 * Create and manage circular nodes
 */
export class CircleNodeHandler {
  /**
   * CircleNodeHandler
   * @param config
   * @param debug
   */
  constructor (config, debug) {
    this.debug  = !!debug;
    //this.debug        = false;
    this.config = _.defaults(config, {
      updateTransition: 250, // ms
      defaultRadius   : 50
    });
    
    // Create a rounding function
    this.round = d3.format('0.4f');
  }
  
  /**
   * Create nodes based on a selection
   * @param selection
   * @param chart
   */
  createNodes (selection, chart) {
    this.debug && console.log('CircleNodeHandler.createNodes');
    const self = this;
    let nodeGroups;
    
    // Create the base groups
    nodeGroups = selection.enter()
        .append('g')
        .attr('class', (d) => {
          return 'node-group ' + (d.depth !== undefined ? 'node-level-' + d.depth : '')
        })
        .attr('data-node-id', (d) => {
          return d._id || d.data._id;
        })
        .attr('data-node-title', (d) => {
          return d.data ? d.data.properties.title : d.properties.title
        })
        .attr('data-parent-id', (d) => {
          return d.parent && (d.parent._id || d.parent.data._id)
        })
        .attr('data-child-index', (d) => {
          return d.childIndex
        })
        .attr('transform', (d) => {
          return 'translate(' + self.round(d.x) + ', ' + self.round(d.y) + ')'
        })
        .on('mouseenter', (d) => {
          // Add the hover class to the node
          //chart.nodeLayer.select('g.node-group[data-node-id='' + (d._id || d.data._id) + '']').classed('hover', true);
          
          // Clone the node to the highlight layer
          
          //self.debug && console.log('CircleNodeHandler triggering nodeMouseEnter:', d);
          $(chart.eventNode).trigger('nodeMouseEnter', [ {
            node : d,
            event: d3.event,
            chart: chart
          } ]);
        })
        .on('mouseleave', (d) => {
          //chart.nodeLayer.select('g.node-group[data-node-id='' + (d._id || d.data._id) + '']').classed('hover', false);
          
          //self.debug && console.log('CircleNodeHandler triggering nodeMouseLeave:', d);
          $(chart.eventNode).trigger('nodeMouseLeave', [ {
            node : d,
            event: d3.event,
            chart: chart
          } ]);
        })
        .on('mousedown', (d) => {
          self.debug && console.log('CircleNodeHandler triggering nodeMouseDown:', d);
          $(chart.eventNode).trigger('nodeMouseDown', [ {
            node : d,
            event: d3.event,
            chart: chart
          } ])
        })
        .on('mouseup', (d) => {
          self.debug && console.log('CircleNodeHandler triggering nodeMouseUp:', d);
          $(chart.eventNode).trigger('nodeMouseUp', [ {
            node : d,
            event: d3.event,
            chart: chart
          } ])
        })
        .on('click', (d) => {
          self.debug && console.log('CircleNodeHandler triggering nodeClick:', d);
          $(chart.eventNode).trigger('nodeClick', [ {
            node : d,
            event: d3.event,
            chart: chart
          } ])
        })
        .on('dblclick', (d) => {
          self.debug && console.log('CircleNodeHandler triggering nodeDblClick:', d);
          $(chart.eventNode).trigger('nodeDblClick', [ {
            node : d,
            event: d3.event,
            chart: chart
          } ])
        })
        .call(d3.drag()
            .on('start', self.dragStarted.bind(chart))
            .on('drag', self.dragged.bind(chart))
            .on('end', self.dragEnded.bind(chart)));
    
    // Add the circle
    nodeGroups.append('circle')
        .attr('class', 'node-circle')
        .attr('r', (d) => {
          return self.round(d.radius)
        })
        .attr('cx', 0)
        .attr('cy', 0);
    
    // Add the label
    nodeGroups.append('text')
        .attr('class', 'node-title')
        .attr('dy', '0.3em')
        .text((d) => {
          return (d.data ? d.data.properties.title : d.properties.title || '').substr(0, Math.ceil(d.radius * 2 / 8))
        });
    
    // Emit nodeCreated events
    nodeGroups.each((d) => {
      //self.debug && console.log('CircleNodeHandler triggering nodeCreated:', d);
      $(chart.eventNode).trigger('nodeCreated', [ {
        node : d,
        chart: chart
      } ])
    });
  }
  
  /**
   * Remove any unneeded nodes
   * @param selection
   * @param chart
   */
  removeNodes (selection, chart) {
    this.debug && console.log('CircleNodeHandler.removeNodes');
    const self = this;
    
    // Emit a removed event for each node that we're removing
    selection.exit()
        .each((d) => {
          // Emit an event
          //self.debug && console.log('CircleNodeHandler triggering nodeRemoved:', d);
          $(chart.eventNode).trigger('nodeRemoved', [ {
            node : d,
            chart: chart
          } ]);
        })
        //.transition()
        //.duration(500)
        //.attr('transform', (d) => {
        //  return 'translate(' + self.round(d.x) + ', -10000)'
        //})
        .remove();
  }
  
  /**
   * Draw the nodes
   * @param selection
   * @param chart
   */
  drawNodes (selection, chart) {
    const self = this;
    
    // Update the nodes
    selection
        .attr('data-x', (d) => {
          return self.round(d.x)
        })
        .attr('data-y', (d) => {
          return self.round(d.y)
        })
        .attr('transform', (d) => {
          return 'translate(' + self.round(d.x) + ', ' + self.round(d.y) + ')'
        })
        .select('.node-circle')
        .attr('r', (d) => {
          if (d.radius) {
            return self.round(d.radius)
          } else {
            //console.error('CircleNodeHandler.drawNodes encountered node without radius:', d);
            return self.config.defaultRadius
          }
        });
  }
  
  /**
   * Create drop node elements
   * @param selection
   * @param chart
   */
  createDropNodes (selection, chart) {
    this.debug && console.log('CircleNodeHandler.createNodes');
    const self = this;
    let nodeGroups;
    
    // Create the base groups
    nodeGroups = selection.enter()
        .append('g')
        .attr('class', (d) => {
          return 'drop-group'
        })
        .attr('data-node-id', (d) => {
          return d._id || d.data._id;
        })
        .attr('transform', (d) => {
          return 'translate(' + self.round(d.x) + ', ' + self.round(d.y) + ')'
        })
        .on('mouseenter', (d) => {
          self.debug && console.log('CircleNodeHandler triggering nodeMouseEnter:', d);
          $(chart.eventNode).trigger('nodeMouseEnter', [ {
            node : d,
            event: d3.event,
            chart: chart
          } ]);
          
          if (self.inDrag && self.drag && self.drag.node && CircleNodeHandler.isDropTarget(self.drag.node, d)) {
            self.debug && console.log('CircleNodeHandler triggering nodeMouseEnter during chart drag:', d._id || d.data._id);
            self.hover = {
              node : d,
              chart: chart
            };
            chart.dropLayer.select('g.drop-group[data-node-id="' + (d._id || d.data._id) + '"]').classed('hover', true);
          }
        })
        .on('mouseleave', (d) => {
          self.debug && console.log('CircleNodeHandler triggering nodeMouseLeave:', d);
          $(chart.eventNode).trigger('nodeMouseLeave', [ {
            node : d,
            event: d3.event,
            chart: chart
          } ]);
          
          if (self.inDrag) {
            self.debug && console.log('CircleNodeHandler triggering nodeMouseLeave during chart drag:', d);
            delete self.hover;
            chart.dropLayer.select('g.drop-group[data-node-id="' + (d._id || d.data._id) + '"]').classed('hover', false);
          }
        });
    
    // Add the circle
    nodeGroups.append('circle')
        .attr('class', 'drop-circle')
        .attr('r', (d) => {
          return self.round(d.radius)
        })
        .attr('cx', 0)
        .attr('cy', 0);
  }
  
  /**
   * Determine if a node is a drop target for a dragged node
   * @param dragNode
   * @param dropNode
   */
  static isDropTarget (dragNode, dropNode) {
    console.log('CircleNodeHandler isDropTarget:', dragNode, dropNode);
    const dropParents   = CircleNodeHandler.getParentChain(dropNode),
          dropParentIds = dropParents.map((d) => {
            return d._id || d.data._id
          }),
          dragId        = dragNode._id || dragNode.data._id,
          dropId        = dropNode._id || dropNode.data._id;
    
    // You cannot drop a node on itself
    if (dragId === dropId) {
      console.log('CircleNodeHandler isDropTarget: false, same node');
      return false;
    }
    
    // You cannot drop a node on a satellite in the universe chart
    if (!dropNode.data) {
      console.log('CircleNodeHandler isDropTarget: false, not a galaxy node');
      return false;
    }
    
    // You cannot drop a node on one of it's children/grandchildren etc
    if (_.contains(dropParentIds, dragId)) {
      console.log('CircleNodeHandler isDropTarget: false, drop node is a child of drag node');
      return false;
    }
    
    // You cannot drop a node on its parent
    if (dragNode.parent && dragNode.parent.data && dropId === dragNode.parent.data._id) {
      console.log('CircleNodeHandler isDropTarget: false, drop node is drag node`s parent');
      return false;
    }
    
    console.log('CircleNodeHandler isDropTarget: true');
    return true;
  }
  
  /**
   * Get the chain of parent nodes for a given node
   * @param d
   */
  static getParentChain (d) {
    let parents = [];
    
    if (d.parent) {
      parents.push(d.parent);
      parents = parents.concat(CircleNodeHandler.getParentChain(d.parent));
    }
    
    return parents
  }
  
  /**
   * Start dragging a node
   * @param d Node being dragged
   */
  dragStarted (d) {
    this.debug && console.log('CircleNodeHandler.dragStarted:', d);
    const chart = this,
          self  = chart.nodeHandler;
    
    // Set the drag flag & make sure there's no cruft left over from a drop
    self.inDrag   = true;
    self.dragNode = d;
    self.drag     = {
      node : d,
      chart: chart
    };
    delete self.hover;
    
    // Hide the associated drop group
    d3.select('.global-drop-layer').classed('in-drag', true);
    chart.dropLayer.select('g.drop-group[data-node-id="' + (d._id || d.data._id) + '"]').classed('hide', true);
    
    // Disable collisions
    if (chart.simulation && chart.simulation.force('collide')) {
      chart.simulation.force('collide').strength(0);
    }
    
    // Detach the simulation forces during the drag
    if (!d3.event.active) {
      chart.simulation.alphaTarget(chart.config.alphaTarget).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
    
    // Emit an event from the chart base
    $(chart.eventNode).trigger('nodeDragStarted', [ {
      node : d,
      event: d3.event,
      chart: chart
    } ])
  }
  
  /**
   * Keep dragging a node
   * @param d Node being dragged
   */
  dragged (d) {
    const chart = this;
    
    // Handle updating node's position
    d.fx = d3.event.x;
    d.fy = d3.event.y;
    
    // Emit an event from the chart base
    $(chart.eventNode).trigger('nodeDragged', [ {
      node : d,
      event: d3.event,
      chart: chart
    } ])
  }
  
  /**
   * Finish dragging a node
   * @param d Node being dragged
   */
  dragEnded (d) {
    this.debug && console.log('CircleNodeHandler.dragEnded:', d);
    const chart = this,
          self  = chart.nodeHandler;
    
    // Clear the drag flag
    self.inDrag = false;
    delete self.dragNode;
    
    // Un-hide the associated drop group
    d3.select('.global-drop-layer').classed('in-drag', false);
    chart.dropLayer.select('g.drop-group[data-node-id="' + (d._id || d.data._id) + '"]').classed('hide', false);
    
    // Enable collisions
    if (chart.simulation && chart.simulation.force('collide')) {
      console.log('Restoring collision force strength:', chart.config.strength.collide);
      chart.simulation.force('collide').strength(chart.config.strength.collide);
    }
    
    // Re-enable the force simulation
    if (!d3.event.active) {
      chart.simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
    
    // Emit an event from the chart base
    $(chart.eventNode).trigger('nodeDragEnded', [ {
      node     : d,
      hoverNode: self.hover && self.hover.node,
      event    : d3.event,
      chart    : chart
    } ]);
    
    // If this is a drop situation, fire a drop event
    if (self.hover && self.hover.node) {
      self.debug && console.log('CircleNodeHandler triggering nodeDropped:', d, self.hover && self.hover.node);
      self.hover.chart.dropLayer.select('g.drop-group[data-node-id="' + (self.hover && self.hover.node.data._id) + '"]')
          .classed('hover', false);
      $(self.hover.chart.eventNode).trigger('nodeDropped', [ {
        dragNode   : d,
        dropNode   : self.hover && self.hover.node,
        dimension  : chart.dimension,
        event      : d3.event,
        chart      : self.hover.chart,
        sourceChart: chart
      } ]);
      
      // Remote the hover node so that it's not present for the next drag
      delete self.hover;
    }
  }
}