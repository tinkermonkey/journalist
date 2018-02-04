'use strict';

/**
 * CircleNodeControls
 *
 * Create and manage circular node controls
 */
export class CircleNodeControls {
  constructor (chart, config, debug) {
    const self = this;
    
    self.chart  = chart;
    //this.debug  = !!debug;
    self.debug  = true;
    self.config = _.defaults(config, {
      updateTransition: 500, // ms
      considerPeriod  : 500, //ms
      minimumRadius   : 15, // px
      margin          : 5, // px
      borderThickness : 3, // px
      startRadius     : 3, // px
      cornerRadius    : 10, // px
      commandAngle    : 0, // angle in radians that the commands will be centered around
      iconSize        : 24, // px
      iconMargin      : 5 // px
    });
    
    // Create a rounding function
    self.round = d3.format('0.4f');
    
    // Calculate the thickness based on the icon size
    self.config.thickness = parseFloat(self.round(self.config.iconSize * Math.sqrt(2) + self.config.borderThickness * 2));
  }
  
  /**
   * Initialize the controls
   * @param {d3.selection} parentLayer The layer on which to add the controls
   * @param {[NodeControlCommand]} commandList The list of commands for to display
   */
  init (parentLayer, commandList) {
    this.debug && console.log('CircleNodeControls.init:', parentLayer, commandList);
    const self = this;
    
    // Store the parent layer
    self.parentLayer = parentLayer;
    
    // Create the base layer
    self.baseLayer = parentLayer.append('g')
        .attr('class', 'circle-node-controls hide')
        .on('mouseenter', () => {
          // If the mouse transitions from a node to a the node controls, make sure the controls don't hide
          self.debug && console.log('CircleNodeControls mouseenter: detach cancelled');
          self.cancelDetach = true;
        })
        .on('mouseleave', () => {
          // If the mouse transitions from a node to a the node controls, make sure the controls don't hide
          self.debug && console.log('CircleNodeControls mouseleave');
          self.considerDetaching();
        });
    
    // Create a layer for the commands
    self.commandLayer = self.baseLayer.append('g')
        .attr('class', 'command-layer');
    
    // Set the command list of they were provided
    if (commandList && commandList.length) {
      self.setCommands(commandList);
    }
  }
  
  /**
   * Update the controls position if they're visible
   */
  update (transitionLocation) {
    this.debug && console.log('CircleNodeControls.update:', transitionLocation);
    const self = this;
    
    // Update the position
    if (self.controlledNode) {
      this.debug && console.log('CircleNodeControls.update position:', self.controlledNode.x, self.controlledNode.y);
      // Update the position
      self.baseLayer
          .transition()
          .duration(transitionLocation ? self.config.updateTransition : 0)
          .attr('transform', 'translate(' + self.round(self.controlledNode.x) + ', ' + self.round(self.controlledNode.y) + ')')
          .style('opacity', 1);
      
      if (self.commandList) {
        // Calculate the arc sweep of each command based on the arc length (icon size) and the radius
        const arcSweep      = (self.config.iconSize * Math.sqrt(2) + self.config.iconMargin) / self.radius,
              startingAngle = self.config.commandAngle - ((self.commandList.length - 1) * arcSweep) / 2;
        
        // Update the icon group positions
        self.commandLayer.selectAll('.command-group')
            .style('pointer-events', 'none')
            .transition()
            .duration(self.config.updateTransition)
            .attr('transform', (d, i) => {
              // Place the group at the center point
              let angle = startingAngle + arcSweep * i;
              d.x       = self.radius * Math.cos(angle);
              d.y       = self.radius * Math.sin(angle);
              return 'translate(' + self.round(d.x) + ', ' + self.round(d.y) + ')';
            })
            .on('end', (d, i) => {
              if (i === self.commandList.length - 1) {
                self.commandLayer.selectAll('.command-group')
                    .style('pointer-events', 'inherit');
              }
            });
        
        // Update the icon background positions
        const innerRadius = self.radius - self.config.thickness / 2 - self.config.borderThickness / 2,
              outerRadius = innerRadius + self.config.thickness + self.config.borderThickness;
        self.commandLayer.selectAll('.command-group')
            .select('.command-slice')
            .transition()
            .duration(self.config.updateTransition)
            .attr('transform', (d, i) => {
              // Place the group at the center point
              let angle = startingAngle + arcSweep * i,
                  x     = self.radius * Math.cos(angle),
                  y     = self.radius * Math.sin(angle);
              return 'translate(' + self.round(-1 * x) + ', ' + self.round(-1 * y) + ')';
            })
            .attr('d', (d, i) => {
              return self.calculateSlicePath(i, innerRadius, outerRadius, startingAngle, arcSweep)
            });
      } else {
        console.error('CircleNodeControls.update error: no commands', self.commandList)
      }
    } else {
      self.baseLayer.classed('hide', true);
    }
  }
  
  /**
   * Set the commands for the menu
   * @param {[NodeControlCommand]} commandList The list of commands to display
   */
  setCommands (commandList) {
    this.debug && console.log('CircleNodeControls.setCommands');
    const self = this;
    
    // Store the command list
    self.commandList = commandList;
    
    // Set the selection
    self.commandSelection = self.commandLayer.selectAll('.command-group')
        .data(self.commandList);
    
    // Append the command groups
    const iconPosition = -1 * self.round(self.config.iconSize / 2),
          commandEnter = self.commandSelection.enter()
              .append('g')
              .attr('class', 'command-group')
              .attr('transform', 'translate(0,0)');
    
    // Create the background
    const innerRadius   = self.config.minimumRadius,
          outerRadius   = innerRadius + self.config.margin,
          arcSweep      = (self.config.iconSize * Math.sqrt(2) + self.config.iconMargin) / self.config.minimumRadius,
          startingAngle = self.config.commandAngle - ((self.commandList.length - 1) * arcSweep) / 2;
    
    commandEnter.append('path')
        .attr('class', 'command-slice')
        .attr('data-command-key', (d) => {
          return d.key
        })
        .attr('d', (d, i) => {
          return self.calculateSlicePath(i, innerRadius, outerRadius, startingAngle, arcSweep)
        })
        .on('mouseenter', (d) => {
          console.log('mouseenter:', d.key);
          self.commandLayer.select('.command-slice[data-command-key="' + d.key + '"]').classed('hover', true);
        })
        .on('mouseleave', (d) => {
          console.log('mouseleave:', d.key);
          self.commandLayer.select('.command-slice[data-command-key="' + d.key + '"]').classed('hover', false);
        });
    
    // Create the icons for each command
    commandEnter.append('image')
        .attr('class', 'command-icon')
        .attr('width', self.config.iconSize)
        .attr('height', self.config.iconSize)
        .attr('transform', 'translate(' + self.round(iconPosition) + ', ' + self.round(iconPosition) + ')')
        .attr('xlink:href', (d) => {
          return d.iconUrl
        });
    
    if (0) {
      commandEnter.append('circle')
          .attr('r', 5)
          .style('fill', '#ff0000');
      
      commandEnter.append('circle')
          .attr('r', Math.abs(iconPosition * Math.sqrt(2)))
          .style('fill', 'none')
          .style('stroke', '#0000ff');
      
      commandEnter.append('rect')
          .attr('x', iconPosition)
          .attr('y', iconPosition)
          .attr('width', self.config.iconSize)
          .attr('height', self.config.iconSize)
          .style('fill', 'none')
          .style('stroke', '#00ff00');
    }
    
    // Remove unused commands
    self.commandSelection.exit().remove();
  }
  
  /**
   * Calculate the path for a control slice
   * @param i
   * @param innerRadius
   * @param outerRadius
   * @param startingAngle
   * @param arcSweep
   */
  calculateSlicePath (i, innerRadius, outerRadius, startingAngle, arcSweep) {
    //this.debug && console.log('CircleNodeControls.calculateSlicePath:', i, innerRadius, outerRadius, startingAngle, arcSweep);
    const self       = this,
          startAngle = startingAngle - arcSweep / 2 + arcSweep * i,
          endAngle   = startAngle + arcSweep,
          a          = {
            x: self.round(Math.cos(startAngle) * innerRadius),
            y: self.round(Math.sin(startAngle) * innerRadius)
          },
          b          = {
            x: self.round(Math.cos(startAngle) * outerRadius),
            y: self.round(Math.sin(startAngle) * outerRadius)
          },
          c          = {
            x: self.round(Math.cos(endAngle) * outerRadius),
            y: self.round(Math.sin(endAngle) * outerRadius)
          },
          d          = {
            x: self.round(Math.cos(endAngle) * innerRadius),
            y: self.round(Math.sin(endAngle) * innerRadius)
          };
    
    //this.debug && console.log('CircleNodeControls.calculateSlicePath points:', a, b, c, d);
    
    let path;
    if (i === 0) {
      // First slice gets rounded A and B corners
      let betaAngle  = startAngle + (self.config.cornerRadius / innerRadius),
          gammaAngle = startAngle + (self.config.cornerRadius / outerRadius),
          e          = {
            x: self.round(Math.cos(betaAngle) * innerRadius),
            y: self.round(Math.sin(betaAngle) * innerRadius)
          },
          f          = {
            x: self.round(Math.cos(startAngle) * (innerRadius + self.config.cornerRadius)),
            y: self.round(Math.sin(startAngle) * (innerRadius + self.config.cornerRadius))
          },
          g          = {
            x: self.round(Math.cos(startAngle) * (outerRadius - self.config.cornerRadius)),
            y: self.round(Math.sin(startAngle) * (outerRadius - self.config.cornerRadius))
          },
          h          = {
            x: self.round(Math.cos(gammaAngle) * outerRadius),
            y: self.round(Math.sin(gammaAngle) * outerRadius)
          };
      
      path = 'M' + e.x + ' ' + e.y +
          ' Q' + a.x + ' ' + a.y + ' ' + f.x + ' ' + f.y +
          ' L' + g.x + ' ' + g.y +
          ' Q' + b.x + ' ' + b.y + ' ' + h.x + ' ' + h.y +
          ' A' + outerRadius + ' ' + outerRadius + ' 0 0 1 ' + c.x + ' ' + c.y +
          ' L' + d.x + ' ' + d.y +
          ' A' + innerRadius + ' ' + innerRadius + ' 0 0 0 ' + e.x + ' ' + e.y + ' Z';
    } else if (i === self.commandList.length - 1) {
      // Last slice get rounded C and D corners
      let betaAngle  = endAngle - (self.config.cornerRadius / outerRadius),
          gammaAngle = endAngle - (self.config.cornerRadius / innerRadius),
          e          = {
            x: self.round(Math.cos(betaAngle) * outerRadius),
            y: self.round(Math.sin(betaAngle) * outerRadius)
          },
          f          = {
            x: self.round(Math.cos(endAngle) * (outerRadius - self.config.cornerRadius)),
            y: self.round(Math.sin(endAngle) * (outerRadius - self.config.cornerRadius))
          },
          g          = {
            x: self.round(Math.cos(endAngle) * (innerRadius + self.config.cornerRadius)),
            y: self.round(Math.sin(endAngle) * (innerRadius + self.config.cornerRadius))
          },
          h          = {
            x: self.round(Math.cos(gammaAngle) * innerRadius),
            y: self.round(Math.sin(gammaAngle) * innerRadius)
          };
      
      path = 'M' + a.x + ' ' + a.y +
          ' L' + b.x + ' ' + b.y +
          ' A' + outerRadius + ' ' + outerRadius + ' 0 0 1 ' + e.x + ' ' + e.y +
          ' Q' + c.x + ' ' + c.y + ' ' + f.x + ' ' + f.y +
          ' L' + g.x + ' ' + g.y +
          ' Q' + d.x + ' ' + d.y + ' ' + h.x + ' ' + h.y +
          ' A' + innerRadius + ' ' + innerRadius + ' 0 0 0 ' + a.x + ' ' + a.y + ' Z';
    } else {
      // Other slices get no rounded corners
      path = 'M' + a.x + ' ' + a.y +
          ' L' + b.x + ' ' + b.y +
          ' A' + outerRadius + ' ' + outerRadius + ' 0 0 1 ' + c.x + ' ' + c.y +
          ' L' + d.x + ' ' + d.y +
          ' A' + innerRadius + ' ' + innerRadius + ' 0 0 0 ' + a.x + ' ' + a.y + ' Z';
    }
    return path
  }
  
  /**
   * Show the controls for a node
   * @param node
   */
  controlNode (node) {
    this.debug && console.log('CircleNodeControls.controlNode:', node);
    const self       = this,
          nodeRadius = Math.max(self.config.minimumRadius, node.radius || 0),
          hidden     = self.baseLayer.classed('hide');
    
    // Set the radius
    self.radius = self.round(nodeRadius + self.config.margin + (self.config.thickness + self.config.borderThickness * 2) / 2);
    
    // Cancel any detach behavior in the pipeline
    self.cancelDetach = true;
    
    // Check for a duplicate calls
    if (self.controlledNode && self.controlledNode.id === node.id) {
      return;
    }
    
    // Store the controlled node
    self.controlledNode = node;
    
    // Make sure the ring is visible
    self.baseLayer.classed('hide', false);
    
    // Highlight the node on the chart
    clearTimeout(self.highlightRemoveTimer);
    self.chart.highlightNode(node);
    
    // Update the position
    self.update(!hidden);
  }
  
  /**
   * Consider detaching from a node
   */
  considerDetaching () {
    this.debug && console.log('CircleNodeControls.considerDetaching');
    const self = this;
    
    // Clear the cancel flag
    self.cancelDetach = false;
    
    // Clear the existing timeout
    clearTimeout(self.detachTimeout);
    
    // Setup the detach to happen unless cancelled
    self.detachTimeout = setTimeout(() => {
      if (!self.cancelDetach) {
        self.detach(true);
      } else {
        self.debug && console.log('CircleNodeControls.considerDetaching: detach cancelled');
      }
    }, self.config.considerPeriod);
  }
  
  /**
   * Detach from a controlled node
   * @param {Boolean} removeNodeHighlight Should the node highlight be removed from the node
   * @param {Boolean} quick Should the detach actions skip the animated transitions
   */
  detach (removeNodeHighlight, quick) {
    this.debug && console.log('CircleNodeControls.detach:', removeNodeHighlight);
    const self     = this,
          duration = quick ? 0 : self.config.updateTransition;
    
    // Remove the controlled node
    delete self.controlledNode;
    
    // Fade the controls
    self.baseLayer.transition()
        .duration(duration)
        .style('opacity', 0)
        .on('end', (d, i) => {
          self.baseLayer.classed('hide', true);
        });
    
    // Move the icons back to the center
    self.commandLayer.selectAll('.command-group')
        .transition()
        .duration(duration)
        .attr('transform', 'translate(0,0)');
    
    // Shrink the arcs
    const innerRadius   = self.config.minimumRadius,
          radius        = innerRadius + self.config.margin / 2,
          outerRadius   = innerRadius + self.config.margin,
          arcSweep      = (self.config.iconSize * Math.sqrt(2)) / self.radius,
          startingAngle = self.config.commandAngle - ((self.commandList.length - 1) * arcSweep) / 2;
    
    self.commandLayer.selectAll('.command-group')
        .select('.command-slice')
        .transition()
        .duration(duration)
        .attr('transform', (d, i) => {
          let angle = startingAngle + arcSweep * i,
              x     = radius * Math.cos(angle),
              y     = radius * Math.sin(angle);
          return 'translate(' + self.round(-1 * x) + ', ' + self.round(-1 * y) + ')';
        })
        .attr('d', (d, i) => {
          return self.calculateSlicePath(i, innerRadius, outerRadius, startingAngle, arcSweep)
        });
    
    // Remove the node highlight
    if (removeNodeHighlight) {
      self.highlightRemoveTimer = setTimeout(() => {
        self.chart.clearHighlight();
      }, duration * 1.1);
      
    }
  }
}