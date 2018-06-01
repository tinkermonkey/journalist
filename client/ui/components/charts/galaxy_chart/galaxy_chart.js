'use strict';

import { CircleNodeHandler }  from './circle_node_handler.js';
import { LineLinkHandler }    from './line_link_handler.js';
import { CircleNodeControls } from './circle_node_controls.js';
import { NodeControlCommand } from './node_control_command.js';

let d3 = require('d3');

/**
 * Galaxy Chart
 *
 * References
 * - Force simulations: https://bl.ocks.org/mbostock/2675ff61ea5e063ede2b5d63c08020c7
 * - Galaxy chart inspiration: https://risacher.org/galaxy-chart/
 *
 * Emits:
 * nodeCreated
 * nodeRemoved
 *
 * nodeMouseEnter
 * nodeMouseLeave
 * nodeClick
 * nodeDblClick
 *
 * nodeDragStarted
 * nodeDragged
 * nodeDragEnded
 *
 * zoomAndTranslate
 *
 */
export class GalaxyChart {
  /**
   * GalaxyChart
   * @param baseSelector
   * @param config
   * @param debug
   */
  constructor (baseSelector, config, debug) {
    const self        = this;
    self.baseSelector = baseSelector;
    self.debug        = !!debug;
    self.links        = [];
    self.nodes        = [];
    self.config       = _.defaults(config, {
      startAngle         : -Math.PI / 2,
      nodeSpread         : 4,    // Radius multiplier
      minSize            : 36,      // No units
      maxSize            : 10000,   // No units
      alphaTarget        : 0.3,
      strength           : {
        link    : 0.0,
        position: 1.00,
        collide : 1.00
      },
      collideRadiusFactor: 1.2,
      zoom               : {
        min    : 0.25,
        max    : 4,
        padding: 20,
        enabled: true
      },
      updateDelayTime    : 30,  // ms
      updateRetryTimer   : 30,  // ms
      maxUpdateRetries   : 5,
      updateTransition   : 250, // ms
      
      // Node sizing function
      sizeFunction (d) {
        return d.properties && d.properties.size ? d.properties.size : d.size;
      }
    });
    
    // Create the node and link handler if we need them
    self.nodeHandler = self.config.nodeHandler ? self.config.nodeHandler : new CircleNodeHandler({}, debug);
    self.linkHandler = self.config.linkHandler ? self.config.linkHandler : new LineLinkHandler({}, debug);
    
    // Create the node controls
    self.nodeControls = self.config.nodeControls ? self.config.nodeControls : new CircleNodeControls(self, {}, debug);
    
    // Create the stratification function
    self.stratify = d3.stratify()
        .id((d) => {
          return d._id
        })
        .parentId((d) => {
          return d.parentIds && self.dimension && d.parentIds[ self.dimension._id ]
        });
    
    // Create a rounding function
    self.round = d3.format('0.4f');
  }
  
  /**
   * Initialize the chart structure
   * @param chartWidth
   * @param chartHeight
   */
  init (chartWidth, chartHeight) {
    this.debug && console.log('GalaxyChart.init:', this.baseSelector);
    const self      = this,
          startTime = Date.now();
    
    // Store the size
    self.width  = chartWidth;
    self.height = chartHeight;
    
    // Find the parent SVG element
    self.svg = d3.select($(self.baseSelector).closest('svg').get(0));
    
    // Select the base element
    self.base = d3.select(self.baseSelector);
    
    // If the base is not found, error out
    if (!self.base.node()) {
      throw new Error('GalaxyChart.init base element could not be found for ' + self.baseSelector);
    }
    
    // Figure out which element events should emit from
    self.eventNode = self.config.eventNode && $(self.config.eventNode).get(0) ? $(self.config.eventNode).get(0) : self.base.node();
    
    // Create the base layer
    self.baseLayer = self.base.append('g')
        .attr('class', 'galaxy-base-layer');
    
    // Create the link layer
    self.linkLayer = self.baseLayer.append('g')
        .attr('class', 'galaxy-link-layer');
    
    // Create the node layer
    self.nodeLayer = self.baseLayer.append('g')
        .attr('class', 'galaxy-node-layer');
    
    // Create the controls layer
    self.controlsLayer = self.baseLayer.append('g')
        .attr('class', 'galaxy-controls-layer');
    
    // Create a drop layer for drop targets
    self.dropLayer = self.svg.select('.global-drop-layer').append('g')
        .attr('class', 'galaxy-drop-layer');
    
    // Create a highlight layer for highlighting nodes
    self.highlightLayer = self.svg.select('.global-highlight-layer').append('g')
        .attr('class', 'galaxy-highlight-layer');
    
    // Create a force layout
    self.simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(function (d) {
          return d.id;
        }).strength(self.config.strength.link))
        .force('xForce', d3.forceX((d) => {
          return d.cx
        }).strength(self.config.strength.position))
        .force('yForce', d3.forceY((d) => {
          return d.cy
        }).strength(self.config.strength.position))
        .force('collide', d3.forceCollide((d) => {
          return d.radius * self.config.collideRadiusFactor
        }).strength(self.config.strength.collide));
    
    // Create the link selection
    self.linkSelection = self.linkLayer.selectAll('.node-link');
    
    // Create the node selection
    self.nodeSelection = self.nodeLayer.selectAll('.node-group');
    
    // Create the drop node selection
    self.dropSelection = self.dropLayer.selectAll('.drop-group');
    
    // Create the highlight node selection
    self.highlightSelection = self.highlightLayer.selectAll('.node-group');
    
    // Create the zoom and translate handler
    self.zoom = d3.zoom()
        .scaleExtent([ self.config.zoom.min, self.config.zoom.max ])
        .on('zoom', self.zoomAndTranslate.bind(self));
    
    // Link the zoom behavior to the base element
    if (self.config.zoom.enabled) {
      if (self.svg.size()) {
        self.svg
            .call(self.zoom)
            .call(self.zoom.transform, d3.zoomIdentity.translate(self.width / 2, self.height / 2).scale(1))
            .on('dblclick.zoom', null);
      } else {
        console.error('Unable to configure zoomer because the root SVG element could not be found');
      }
    }
    
    // Create the control commands
    self.commandList = [
      new NodeControlCommand('/icomoon/006-pencil.svg', 'edit', 'Edit', (node, chart) => {
        console.log('Edit:', node, chart)
      }),
      new NodeControlCommand('/icomoon/189-tree.svg', 'tree', 'Tree', (node, chart) => {
        console.log('Tree:', node, chart)
      }),
      new NodeControlCommand('/icomoon/369-table.svg', 'table', 'Table', (node, chart) => {
        console.log('Table:', node, chart)
      }),
      new NodeControlCommand('/icomoon/135-search.svg', 'search', 'Search', (node, chart) => {
        console.log('Search:', node, chart)
      })
    ];
    
    // Initialize the controls
    self.nodeControls.init(self.controlsLayer, self.commandList);
    
    // Track the time
    self.debug && console.log('GalaxyChart.init completed in', (Date.now() - startTime), 'ms');
  }
  
  /**
   * Update the chart with data
   * @param dimension
   * @param rawDataPoints
   * @param chartWidth
   * @param chartHeight
   * @param retryIteration
   */
  update (dimension, rawDataPoints, chartWidth, chartHeight, retryIteration) {
    this.debug && console.log('GalaxyChart.update:', rawDataPoints && rawDataPoints.length, 'records');
    const self      = this,
          startTime = Date.now();
    
    // Check to see if an update is already in progress
    if (self.updateInProgress) {
      retryIteration = retryIteration ? retryIteration + 1 : 1;
      if (retryIteration < self.config.maxUpdateRetries) {
        self.debug && console.log('GalaxyChart.update in progress, rescheduling update for', self.config.updateRetryTimer, 'ms');
        setTimeout(() => {
          self.update(dimension, rawDataPoints, chartWidth, chartHeight, retryIteration);
        }, self.config.updateRetryTimer);
      } else {
        console.error('GalaxyChart.update: unable to update after', retryIteration, 'attempts due to concurrent updates');
      }
    } else {
      self.updateInProgress = true;
      
      // Process the data
      self.processData(dimension, rawDataPoints);
      self.debug && console.log('GalaxyChart data:', self.data);
      
      // Update the layout
      self.layout(chartWidth, chartHeight);
      
      // Update the simulation
      self.simulation
          .nodes(self.nodes)
          .on('tick', self.drawChart.bind(self));
      
      self.simulation.force('link')
          .links(self.links);
      
      // Create new nodes and links
      self.nodeHandler.createNodes(self.nodeSelection, self);
      self.nodeHandler.createDropNodes(self.dropSelection, self);
      self.linkHandler.createLinks(self.linkSelection, self);
      
      // Remove old nodes and links
      self.nodeHandler.removeNodes(self.nodeSelection, self);
      self.nodeHandler.removeNodes(self.dropSelection, self);
      self.linkHandler.removeLinks(self.linkSelection, self);
      
      // Update the layout again to pick up created nodes in the selections
      self.layout(chartWidth, chartHeight);
      
      // Kick the simulation to make it work
      self.simulation.stop();
      self.simulation.alpha(self.config.alphaTarget).restart();
      
      // Update complete
      self.debug && console.log('GalaxyChart.update completed in', (Date.now() - startTime), 'ms');
      setTimeout(() => {
        self.updateInProgress = false;
      }, self.config.updateDelayTime);
    }
  }
  
  /**
   * Update the chart layout
   * @param chartWidth
   * @param chartHeight
   */
  layout (chartWidth, chartHeight) {
    this.debug && console.log('GalaxyChart.layout:', chartWidth, chartHeight);
    const startTime = Date.now(),
          self      = this;
    
    // Update the link selection
    self.linkSelection = self.linkLayer.selectAll('.node-connector')
        .data(self.links, function (d) {
          return d._id
        });
    
    // Update the node selection
    self.nodeSelection = self.nodeLayer.selectAll('.node-group')
        .data(self.nodes, function (d) {
          return d.data._id
        });
    
    // Update the drop selection
    self.dropSelection = self.dropLayer.selectAll('.drop-group')
        .data(self.nodes, function (d) {
          return d.data._id
        });
    
    // Store the size
    self.width  = chartWidth || self.width;
    self.height = chartHeight || self.height;
    
    // Update the zoom extents
    self.zoom.extent([ [ 0, 0 ], [ self.width, self.height ] ]);
    
    // Calculate the gravity centers of the nodes
    self.positionNodeTree(self.data);
    
    // Monitor the execution time
    self.debug && console.log('GalaxyChart.layout time:', Date.now() - startTime, 'ms');
  }
  
  /**
   * Process data into the necessary format
   * @param dimension The data dimension
   * @param rawDataPoints [Object] The raw list of records to chart
   */
  processData (dimension, rawDataPoints) {
    this.debug && console.log('GalaxyChart.processData:', rawDataPoints && rawDataPoints.length, 'records in raw data');
    const self      = this,
          startTime = Date.now();
    
    let minSize = 0,
        maxSize = 0;
    
    // Store the dimension record
    self.dimension = dimension;
    
    // Make sure there's data to stratify
    if (!rawDataPoints.length) {
      self.debug && console.log('GalaxyChart.processData raw data contains zero records');
      self.data = [];
      return;
    }
    
    // Create the stratified data structure from the raw data
    try {
      self.data = self.stratify(rawDataPoints);
      self.debug && console.log('GalaxyChart.processData stratified height:', self.data.height);
    } catch (e) {
      console.error('GalaxyChart.processData stratify failed:', e, rawDataPoints);
    }
    
    // Calculate the size of each node
    self.data.each((d) => {
      //d.size = (d.data.properties && d.data.properties.size ? d.data.properties.size : d.data.size) || 0;
      d.size = self.config.sizeFunction(d.data) || 0;
      
      minSize = d.size < minSize ? d.size : minSize;
      maxSize = d.size > maxSize ? d.size : maxSize;
    });
    
    // If everything is the same size, size the nodes based on children count
    if (minSize === maxSize) {
      self.data.each((d) => {
        d.size = d.children ? d.height * d.children.length : 1;
        
        minSize = d.size < minSize ? d.size : minSize;
        maxSize = d.size > maxSize ? d.size : maxSize;
      });
    }
    
    // Do a linear fit based on the sizes
    const scale  = (self.config.maxSize - self.config.minSize) / (maxSize - minSize),
          offset = self.config.minSize - minSize * scale;
    self.data.each((d) => {
      d.size = d.size * scale + offset;
    });
    
    // Create a flattened index of the linked nodes
    self.nodes = [];
    self.links = [];
    self.data.each((d) => {
      // Mark all of the child node indices
      if (d.children) {
        d.children
            .sort((a, b) => {
              return b.size - a.size
            })
            .forEach((child, index) => {
              child.childIndex = index;
              
              // Add a link
              self.links.push({
                _id   : d.data._id + '_' + child.data._id,
                source: d.data._id,
                target: child.data._id
              })
            })
      }
      
      // Index the node
      self.nodes.push(d);
    });
    self.debug && console.log('GalaxyChart.processData nodes:', self.nodes.length);
    self.debug && console.log('GalaxyChart.processData links:', self.links.length);
    
    // Monitor the execution time
    self.debug && console.log('GalaxyChart.processData time:', Date.now() - startTime, 'ms');
  }
  
  /**
   * Calculate the position of a node
   * @param d
   */
  positionNode (d) {
    //this.debug && console.log('GalaxyChart.positionNode:', node.data.properties.title);
    let self = this;
    
    // Calculate the node radius
    d.radius = Math.sqrt(d.size);
    
    if (d.parent) {
      // position relative to parent
      let familySize = d.parent.children.length;
      
      // Calculate the distance from the parent
      d.distance = d.radius * self.config.nodeSpread + d.parent.radius;
      
      // Calculate the angle by spreading out the nodes evenly
      d.angle = d.parent.angle - (d.childIndex * 2 * Math.PI / familySize) - (familySize % 2 || d.parent.depth < 1 ? 0 : -Math.PI / familySize);
      
      // Calculate the relative position
      d.dx = d.distance * Math.sin(d.angle);
      d.dy = d.distance * Math.cos(d.angle);
      
      // Calculate the absolute position
      d.cx = Math.round(d.parent.cx + d.dx);
      d.cy = Math.round(d.parent.cy + d.dy);
      
      let nodeElement = $('.node-group[data-node-id="' + d.data._id + '"]');
      if (nodeElement.length) {
        try {
          d.x = parseFloat(nodeElement.attr('data-x')) || d.cx;
          d.y = parseFloat(nodeElement.attr('data-y')) || d.cy;
        } catch (e) {
          console.error('GalaxyChart.positionNode error parsing existing position:', d.data, nodeElement.attr('data-x'), nodeElement.attr('data-y'));
          d.x = d.cx;
          d.y = d.cy;
        }
      } else {
        d.x = d.cx;
        d.y = d.cy;
      }
    } else {
      d.x = d.cx = 0;
      d.y = d.cy = 0;
      d.angle = self.config.startAngle;
    }
  }
  
  /**
   * Recursively position a tree of nodes
   * @param d
   * @param i Recursive iteration
   */
  positionNodeTree (d, i) {
    this.debug && !i && console.log('GalaxyChart.positionNodeTree:', d.data.properties.title, d.children && d.children.length, i);
    let self = this;
    
    if (i > 100) {
      console.error('Unbounded recursion:', i, d);
      return;
    }
    
    // Update the position of the root of the tree
    self.positionNode(d);
    
    // Iterate through the children and update the position of each of them
    d.children && d.children.forEach((child) => {
      self.positionNodeTree(child, (i || 0) + 1);
    });
  }
  
  /**
   * Update the position of the nodes and links
   */
  drawChart () {
    let self = this;
    
    //console.log('GalaxyChart.drawNodes:', self.nodeSelection.size());
    
    // Draw the nodes
    self.nodeHandler.drawNodes(self.nodeSelection, self);
    
    // Draw the drop nodes
    self.nodeHandler.drawNodes(self.dropSelection, self);
    
    // Draw the highlighted nodes
    if (self.highlightedNode) {
      self.nodeHandler.drawNodes(self.highlightSelection, self);
    }
    
    // Draw the links
    self.linkHandler.drawLinks(self.linkSelection, self);
  }
  
  /**
   * Zoom and translate the chart
   */
  zoomAndTranslate () {
    //this.debug && console.log('GalaxyChart.zoomAndTranslate:', d3.event.transform);
    let self      = this,
        transform = d3.event.transform;
    
    // Store the scale for reference
    self.scale = transform.k;
    //self.debug && console.log('GalaxyChart.zoomAndTranslate scale:', self.scale);
    
    // Transform the base layer accordingly
    self.baseLayer.attr('transform', transform);
    self.dropLayer.attr('transform', transform);
    self.highlightLayer.attr('transform', transform);
    
    // Emit an event from the chart base
    $(self.eventNode).trigger('zoomAndTranslate', [ d3.event ]);
  }
  
  /**
   * Zoom to the bounds of the elements of the chart
   * @param duration Transition duration for the zoom
   */
  zoomBounds (duration) {
    //this.debug && console.log('GalaxyChart.zoomBounds:', this.width, this.height, duration);
    const self = this;
    
    let minX = 1000000,
        minY = 1000000,
        maxX = -1000000,
        maxY = -1000000;
    
    // Go through all of nodes and get the bounds
    self.nodes.forEach((d) => {
      minX = d.x - d.radius < minX ? d.x - d.radius : minX;
      minY = d.y - d.radius < minY ? d.y - d.radius : minY;
      maxX = d.x + d.radius > maxX ? d.x + d.radius : maxX;
      maxY = d.y + d.radius > maxY ? d.y + d.radius : maxY;
    });
    //self.debug && console.log('GalaxyChart.zoomBounds min/max:', minX, maxX, minY, maxY);
    
    // Add the padding
    minX -= self.config.zoom.padding;
    minY -= self.config.zoom.padding;
    maxX += self.config.zoom.padding;
    maxY += self.config.zoom.padding;
    //self.debug && console.log('GalaxyChart.zoomBounds min/max with padding:', minX, maxX, minY, maxY);
    
    // Figure out the scale and the translation
    let width  = maxX - minX,
        height = maxY - minY,
        scale, x0, y0;
    
    if (width / self.width > height / self.height) {
      //self.debug && console.log('GalaxyChart.zoomBounds unbounded scale:', width / self.width);
      scale = self.round(Math.min(Math.max(self.config.zoom.min, width / self.width), self.config.zoom.max));
      x0    = self.round(-minX / scale);
      y0    = self.round(-minY / scale + (self.height - height / scale) / 2);
    } else {
      //self.debug && console.log('GalaxyChart.zoomBounds unbounded scale:', height / self.height);
      scale = self.round(Math.min(Math.max(self.config.zoom.min, height / self.height), self.config.zoom.max));
      x0    = self.round(-minX / scale + (self.width - width / scale) / 2);
      y0    = self.round(-minY / scale);
    }
    
    // Put the scale through a filter to keep the bounds sane
    //self.debug && console.log('GalaxyChart.zoomBounds scale and offset:', scale, x0, y0);
    
    // Do the transformation
    self.svg
        .transition()
        .duration(duration || 0)
        .call(self.zoom.transform, d3.zoomIdentity.translate(x0, y0).scale(1 / scale));
  }
  
  /**
   * Highlight a node
   * @param node
   */
  highlightNode (node) {
    this.debug && console.log('GalaxyChart.highlightNode:', node);
    const self = this;
    
    // Store the node as the highlightedNode
    self.highlightedNode = node;
    
    // Remove any existing highlight nodes
    self.highlightLayer.selectAll('.node-group').remove();
    
    // Update the highlight selection
    self.highlightSelection = self.highlightLayer.selectAll('.node-group')
        .data([ self.highlightedNode ], function (d) {
          return d.data._id
        });
    
    // Create the node
    self.nodeHandler.createNodes(self.highlightSelection, self);
    
    // Update the selection so that click-drag tracking works
    self.highlightSelection = self.highlightLayer.selectAll('.node-group');
  }
  
  /**
   *
   */
  clearHighlight () {
    this.debug && console.log('GalaxyChart.clearHighlight');
    const self = this;
    
    // Cleart the highlightedNode
    delete self.highlightedNode;
    
    // Remove the highlight nodes
    self.highlightLayer.selectAll('.node-group').remove();
  }
}