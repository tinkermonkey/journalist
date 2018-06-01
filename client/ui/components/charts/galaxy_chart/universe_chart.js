'use strict';

import { GalaxyChart }       from '../galaxy_chart/galaxy_chart.js';
import { CircleNodeHandler } from './circle_node_handler.js';
import { LineLinkHandler }   from './line_link_handler.js';

let d3 = require('d3');

/**
 * Universe Chart
 *
 * Packs together a group of galaxy charts
 *
 * References
 * - https://github.com/d3/d3-hierarchy/blob/master/README.md#partition
 *
 */
export class UniverseChart {
  /**
   * UniverseChart
   * @param baseSelector
   * @param config
   * @param debug
   */
  constructor (baseSelector, config, debug) {
    const self        = this;
    self.baseSelector = baseSelector;
    self.debug        = !!debug;
    self.config       = _.defaults(config, {
      maxColumns    : 2,
      columnWidth   : 0.05, // % of width per column of satellites
      columnMinWidth: 100, // Minimum width in pixels
      minSize       : 20,      // No units
      maxSize       : 2000,   // No units
      alphaTarget   : 0.3,
      strength      : {
        position: 1.00,
        collide : 1.00
      },
      galaxy        : {
        eventNode: baseSelector
      },
      
      // Node sizing function
      sizeFunction (d) {
        return d.properties && d.properties.size ? d.properties.size : d.size;
      }
    });
    
    // Create the node and link handler if we need them
    self.nodeHandler = self.config.nodeHandler ? self.config.nodeHandler : new CircleNodeHandler({}, debug);
    self.linkHandler = self.config.linkHandler ? self.config.linkHandler : new LineLinkHandler({}, debug);
    
    // Wire up the galaxy chart config
    config.galaxy.sizeFunction = self.config.sizeFunction;
    config.galaxy.nodeHandler  = self.nodeHandler;
    config.galaxy.linkHandler  = self.linkHandler;
    
    // Create the galaxy chart
    self.galaxy = new GalaxyChart('.galaxy-chart', config.galaxy, debug);
    
    // Create a rounding function
    self.round = d3.format('0.4f');
  }
  
  /**
   * Initialize the chart structure
   * @param chartWidth
   * @param chartHeight
   */
  init (chartWidth, chartHeight) {
    this.debug && console.log('UniverseChart.init:', this.baseSelector);
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
      throw new Error('UniverseChart.init base element could not be found for ' + self.baseSelector);
    }
    
    // Figure out which element events should emit from
    self.eventNode = self.config.eventNode && $(self.config.eventNode).get(0) ? $(self.config.eventNode).get(0) : self.base.node();
    
    // Create the base layer
    self.baseLayer = self.base.append('g')
        .attr('class', 'universe-base');
    
    // Create the satellite layer
    self.nodeLayer = self.baseLayer.append('g')
        .attr('class', 'satellite-layer');
    
    // Create the galaxy chart layer
    self.galaxyLayer = self.baseLayer.append('g')
        .attr('class', 'galaxy-chart');
    
    // Create a global drop layer for drop chart drop layers
    self.globalDropLayer = self.base.append('g')
        .attr('class', 'global-drop-layer');
    
    // Create a global drop layer for drop chart drop layers
    self.globalHighlightLayer = self.base.append('g')
        .attr('class', 'global-highlight-layer');
    
    // Create a drop layer for drop chart drop layers
    self.dropLayer = self.globalDropLayer.append('g')
        .attr('class', 'universe-drop-layer');
    
    // Create a highlight layer for highlighting nodes
    self.highlightLayer = self.svg.select('.global-highlight-layer').append('g')
        .attr('class', 'universe-highlight-layer');
    
    // Create the node selection
    self.nodeSelection = self.nodeLayer.selectAll('.node-group');
    
    // Create the node selection
    self.dropSelection = self.dropLayer.selectAll('.node-group');
    
    // Create the highlight node selection
    self.highlightSelection = self.highlightLayer.selectAll('.node-group');
    
    // Create a force layout
    self.simulation = d3.forceSimulation()
        .force('xForce', d3.forceX((d) => {
          return d.cx
        }).strength(self.config.strength.position))
        .force('yForce', d3.forceY((d) => {
          return d.cy
        }).strength(self.config.strength.position));
    
    // Initialize the Galaxy Chart
    self.galaxy.init(chartWidth, chartHeight);
    
    // Track the time
    self.debug && console.log('UniverseChart.init completed in', (Date.now() - startTime), 'ms');
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
    this.debug && console.log('UniverseChart.update:', dimension, rawDataPoints && rawDataPoints.length, 'records');
    const self      = this,
          startTime = Date.now();
    
    // Check to see if an update is already in progress
    if (self.updateInProgress) {
      retryIteration = retryIteration ? retryIteration + 1 : 1;
      if (retryIteration < self.config.maxUpdateRetries) {
        self.debug && console.log('UniverseChart.update in progress, rescheduling update for', self.config.updateRetryTimer, 'ms');
        setTimeout(() => {
          self.update(dimension, rawDataPoints, chartWidth, chartHeight, retryIteration);
        }, self.config.updateRetryTimer);
      } else {
        console.error('UniverseChart.update: unable to update after', retryIteration, 'attempts due to concurrent updates');
      }
    } else {
      self.updateInProgress = true;
      
      // Process the data
      self.processData(dimension, rawDataPoints);
      
      // Update the layout
      self.layout(chartWidth, chartHeight);
      
      // Update the simulation
      self.simulation.nodes(self.satellites)
          .on('tick', self.drawChart.bind(self));
      
      // Create new nodes
      self.nodeHandler.createNodes(self.nodeSelection, self);
      
      // Remove old nodes
      self.nodeHandler.removeNodes(self.nodeSelection, self);
      
      // Update the layout again to pick up created nodes in the selections
      self.layout(chartWidth, chartHeight);
      
      // Kick the simulation to make it work
      self.simulation.stop();
      self.simulation.alpha(self.config.alphaTarget).restart();
      
      // Update the Galaxy
      self.galaxy.update(dimension, self.galaxyData, self.galaxyChartWidth(), chartHeight);
      
      // Update complete
      self.debug && console.log('UniverseChart.update completed in', (Date.now() - startTime), 'ms');
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
    this.debug && console.log('UniverseChart.layout:', chartWidth, chartHeight);
    const self      = this,
          startTime = Date.now();
    
    // Update the node selection
    self.nodeSelection = self.nodeLayer.selectAll('.node-group')
        .data(self.satellites, function (d) {
          return d._id
        });
    
    // Store the size
    self.width  = chartWidth || self.width;
    self.height = chartHeight || self.height;
    
    // Figure out how many columns of satellites to show
    self.columnWidth        = Math.max(parseInt(self.width * self.config.columnWidth), self.config.columnMinWidth);
    self.nodesPerColumn     = Math.floor(self.height / self.columnWidth);
    self.displayColumnCount = Math.min(Math.floor(self.satellites.length / self.nodesPerColumn), self.config.maxColumns);
    self.totalColumnCount   = Math.ceil(self.satellites.length / self.nodesPerColumn);
    
    // If there isn't a full column but there's a satellite to show, make sure it's visible
    if (self.displayColumnCount === 0 && self.satellites.length) {
      self.displayColumnCount = 1;
    }
    self.debug && console.log('UniverseChart.layout column metrics:', self.columnWidth, self.nodesPerColumn, self.displayColumnCount);
    
    // Update the position of the satellite layer
    self.nodeLayer.attr('transform', 'translate(' + parseInt(self.width - self.columnWidth * self.displayColumnCount) + ', 0)');
    self.highlightLayer.attr('transform', 'translate(' + parseInt(self.width - self.columnWidth * self.displayColumnCount) + ', 0)');
    
    // Position the nodes
    self.positionNodes();
    
    // Update the Galaxy layout
    self.galaxy.layout(self.galaxyChartWidth(), self.height);
    
    // Monitor the execution time
    self.debug && console.log('UniverseChart.layout time:', Date.now() - startTime, 'ms');
  }
  
  /**
   * Update the position of the nodes and links
   */
  drawChart () {
    const self = this;
    
    // Draw the nodes
    self.nodeHandler.drawNodes(self.nodeSelection, self);
    
    // Draw the highlighted nodes
    if (self.highlightedNode) {
      self.nodeHandler.drawNodes(self.highlightSelection, self);
    }
  }
  
  /**
   * Process data into the necessary format
   * @param dimension The dimension record for the current data
   * @param rawDataPoints [Object] The raw list of records to chart
   */
  processData (dimension, rawDataPoints) {
    this.debug && console.log('UniverseChart.processData:', rawDataPoints && rawDataPoints.length, 'records in raw data');
    const self      = this,
          startTime = Date.now();
    
    let minSize = 0,
        maxSize = 0;
    
    // Store the dimension
    self.dimension = dimension;
    
    // Identify the satellites
    self.satellites = rawDataPoints.filter((d) => {
      return d.dimensionParent(self.dimension._id) === undefined
    });
    self.debug && console.log('UniverseChart.processData satellites:', self.satellites.length);
    
    // Identify the Galaxy data points
    self.galaxyData = rawDataPoints.filter((d) => {
      return d.dimensionParent(self.dimension._id) !== undefined
    });
    self.debug && console.log('UniverseChart.processData galaxyData:', self.galaxyData.length);
    
    // Identify the galaxy center
    if (self.satellites.length === 1) {
      self.debug && console.log('UniverseChart.processData one satellite, using it as the center:', self.satellites[ 0 ]);
      self.galaxyCenter = self.satellites[ 0 ];
    } else {
      try {
        let parentIdList     = self.galaxyData.reduce((idList, d) => {
              return _.uniq(idList.concat([ d.dimensionParent(self.dimension._id) ]))
            }, []),
            galaxyNodeIdList = self.galaxyData.map((d) => {
              return d._id
            }),
            galaxyCenterList = _.difference(parentIdList, galaxyNodeIdList),
            galaxyCenterId;
        
        if (galaxyCenterList.length > 1) {
          self.debug && console.log('UniverseChart.processData found multiple galaxy centers:', galaxyCenterList);
          let galaxyCenterOptions = galaxyCenterList.map((dataPointId) => {
            let dataPoint = rawDataPoints.find((d) => {
              return d._id === dataPointId
            });
            
            dataPoint.childIds = dataPoint.dimensionChildTreeIds(self.dimension._id);
            
            self.debug && console.log('UniverseChart.processData galaxy center option:', dataPointId, dataPoint);
            return dataPoint
          }).sort((a, b) => {
            return a.childIds.length > b.childIds.length ? -1 : 1
          });
          
          galaxyCenterId = galaxyCenterOptions[ 0 ]._id;
          
          // Move the other options over to the satellites list
          for (let i = 1; i < galaxyCenterOptions.length; i++) {
            self.debug && console.log('UniverseChart.processData moving galaxy center option to satellites list:', galaxyCenterOptions[ i ]);
            self.satellites.push(rawDataPoints.find((d) => {
              return d._id === galaxyCenterOptions[ i ]._id
            }));
            
            self.debug && console.log('UniverseChart.processData removing galaxy center option and children from galaxyData:', galaxyCenterOptions[ i ]);
            self.galaxyData = self.galaxyData.filter((d) => {
              return d._id !== galaxyCenterOptions[ i ]._id && !_.contains(galaxyCenterOptions[ i ].childIds, d._id)
            });
          }
          
          // Double check that everything in the galaxy data maps in
          self.galaxyData = self.galaxyData.filter((d) => {
            return _.contains(galaxyCenterOptions[ 0 ].childIds, d._id)
          });
        } else if (galaxyCenterList.length > 0) {
          galaxyCenterId = galaxyCenterList[ 0 ]
        } else {
          console.error('UniverseChart.processData could not identify galaxy center:', self.galaxyData, parentIdList, galaxyNodeIdList);
          return;
        }
        
        //self.debug && console.log('UniverseChart.processData parentIds:', parentIdList);
        //self.debug && console.log('UniverseChart.processData galaxyCenterId:', galaxyCenterId);
        //self.debug && console.log('UniverseChart.processData satelliteIds:', self.satellites.map((d) => { return d._id }));
        
        self.galaxyCenter = self.satellites.find((d) => {
          return d._id === galaxyCenterId
        });
      } catch (e) {
        console.error('UniverseChart.processData could not identify galaxy center:', e);
        return;
      }
    }
    
    // Add the galaxy center to the galaxy data and remove it from the list of satellites
    self.debug && console.log('UniverseChart.processData galaxyCenter:', self.galaxyCenter);
    if (self.galaxyCenter) {
      self.galaxyData.push(self.galaxyCenter);
      self.satellites = self.satellites.filter((d) => {
        return d._id !== self.galaxyCenter._id
      });
    } else {
      console.error('UniverseChart.processData could not identify a galaxy center',);
      return;
    }
    
    // Calculate the size of the satellites
    self.satellites.forEach((d) => {
      d.size = self.config.sizeFunction(d) || 0;
      
      minSize = d.size < minSize ? d.size : minSize;
      maxSize = d.size > maxSize ? d.size : maxSize;
    });
    
    // Do a linear fit based on the sizes
    if (minSize !== maxSize) {
      let scale  = (self.config.maxSize - self.config.minSize) / (maxSize - minSize),
          offset = self.config.minSize - minSize * scale;
      self.satellites.forEach((d) => {
        d.size = d.size * scale + offset;
      });
      self.debug && console.log('UniverseChart.processData scaled element size:', scale, offset);
    } else {
      self.satellites.forEach((d) => {
        d.size = self.config.maxSize;
      });
    }
    
    // Sort the satellites by size, descending
    self.satellites.sort((a, b) => {
      return b.size - a.size
    });
    
    // Process the galaxy data
    self.galaxy.processData(self.dimension, self.galaxyData);
    
    // Track the compute time
    self.debug && console.log('UniverseChart.processData time:', Date.now() - startTime, 'ms');
  }
  
  /**
   * Position the satellite nodes
   */
  positionNodes () {
    this.debug && console.log('UniverseChart.positionNodes:', this.satellites.length);
    const self      = this,
          startTime = Date.now(),
          rowHeight = self.height / self.nodesPerColumn;
    
    let i, j, k, d;
    
    // Walk through the columns and rows and position the nodes
    for (i = 0; i < self.totalColumnCount; i++) {
      for (j = 0; j < self.nodesPerColumn; j++) {
        k = i * self.nodesPerColumn + j;
        if (k < self.satellites.length) {
          //self.debug && console.log('UniverseChart.positionNodes positioning node', k, 'of', self.satellites.length, 'in column', i, 'row', j);
          d = self.satellites[ k ];
          
          // Calculate the node radius
          d.radius = Math.sqrt(d.size);
          
          // Calcuate the gravity center
          d.cx = self.columnWidth / 2 + i * self.columnWidth;
          d.cy = rowHeight / 2 + j * rowHeight;
          
          // Check to see if the element exists
          let nodeElement = $('.node-group[data-node-id="' + d._id + '"]');
          if (nodeElement.length) {
            try {
              d.x = parseFloat(nodeElement.attr('data-x')) || d.cx;
              d.y = parseFloat(nodeElement.attr('data-y')) || d.cy;
            } catch (e) {
              console.error('UniverseChart.positionNodes error parsing existing position:', d, nodeElement.attr('data-x'), nodeElement.attr('data-y'));
              d.x = d.cx;
              d.y = d.cy;
            }
          } else {
            d.x = d.cx;
            d.y = d.cy;
          }
        }
      }
    }
    
    // Track the compute time
    self.debug && console.log('UniverseChart.positionNodes time:', Date.now() - startTime, 'ms');
  }
  
  /**
   * Zoom to the bounds of the elements of the chart
   * @param duration Transition duration for the zoom
   */
  zoomBounds (duration) {
    //this.debug && console.log('UniverseChart.zoomBounds:', this.width, this.height, duration);
    const self = this;
    
    self.galaxy.zoomBounds(duration);
  }
  
  /**
   * Calculate the galaxy chart width
   */
  galaxyChartWidth () {
    const self = this;
    return self.width - self.columnWidth * self.displayColumnCount;
  }
  
  /**
   * Highlight a node
   * @param node
   */
  highlightNode (node) {
    this.debug && console.log('UniverseChart.highlightNode:', node);
    const self = this;
    
    // Store the node as the highlightedNode
    self.highlightedNode = node;
    
    // Remove any existing highlight nodes
    self.highlightLayer.selectAll('.node-group').remove();
    
    // Update the highlight selection
    self.highlightSelection = self.highlightLayer.selectAll('.node-group')
        .data([ self.highlightedNode ], function (d) {
          return d._id
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
    this.debug && console.log('UniverseChart.clearHighlight');
    const self = this;
    
    // Cleart the highlightedNode
    delete self.highlightedNode;
    
    // Remove the highlight nodes
    self.highlightLayer.selectAll('.node-group').remove();
  }
  
}