'use strict';

/**
 * LineLinkHandler
 *
 * Create and manage linear links
 */
export class LineLinkHandler {
  /**
   * LineLinkHandler
   * @param config
   * @param debug
   */
  constructor (config, debug) {
    this.debug  = !!debug;
    this.config = _.defaults(config, {
      updateTransition: 250 // ms
    });
    
    // Create a rounding function
    this.round = d3.format('0.4f');
  }
  
  /**
   * Create the links
   * @param selection
   * @param chart
   */
  createLinks (selection, chart) {
    this.debug && console.log('LineLinkHandler.createLinks');
    let self           = this,
        links, created = 0;
    
    links = selection.enter()
        .each((d, i) => {
          created++;
          //self.debug && console.log('LineLinkHandler.createLinks [', i, ']', d.source, d.target);
        })
        .append('line')
        .attr('class', 'node-connector')
        .attr('x1', (d) => {
          return d.source.x && self.round(d.source.x)
        })
        .attr('y1', (d) => {
          return d.source.y && self.round(d.source.y)
        })
        .attr('x2', (d) => {
          return d.target.x && self.round(d.target.x)
        })
        .attr('y2', (d) => {
          return d.target.y && self.round(d.target.y)
        });
    
    this.debug && console.log('LineLinkHandler.createLinks created', created, 'links');
  }
  
  /**
   * Remove any unneeded links
   * @param selection
   * @param chart
   */
  removeLinks (selection, chart) {
    this.debug && console.log('LineLinkHandler.removeLinks');
    let self = this;
    
    // Emit a removed event for each node that we're removing
    selection.exit()
        .remove();
  }
  
  /**
   * Draw the links
   * @param selection
   * @param chart
   */
  drawLinks (selection, chart) {
    let self = this;
    
    // Determine the transition duration
    //let duration = self.inDrag ? 0 : self.config.updateTransition;
    let duration = 0;
    //self.debug && console.log('LineLinkHandler.drawChart:', duration, chart.inDrag, self.config.updateTransition);
    
    // Update the links
    selection
        .transition()
        .duration(duration)
        .attr('x1', (d) => {
          return self.round(d.source.x)
        })
        .attr('y1', (d) => {
          return self.round(d.source.y)
        })
        .attr('x2', (d) => {
          return self.round(d.target.x)
        })
        .attr('y2', (d) => {
          return self.round(d.target.y)
        });
  }
}