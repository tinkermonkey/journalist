import { Util } from '../../../../../imports/api/util';
import { CapacityPlanBlockTypes } from '../../../../../imports/api/capacity_plans/capacity_plan_block_types';
import { D3ContributorDragControlHandler } from './d3_contributor_drag_control_handler';

let d3            = require('d3'),
    controlTextX  = 0,
    controlTextY  = 0,
    controlRadius = 10,
    debug         = false;

export class D3CapacityPlanBlockHandler {
  /**
   * D3CapacityPlanBlockHandler takes care of constructing and updating the capacity plan blocks
   * @param chart
   */
  constructor (chart) {
    this.chart          = chart;
    this.controlHandler = new D3ContributorDragControlHandler(chart, this);
    this.lastUpdateTime = 0;
  }
  
  /**
   * Service the blocks on the chart
   */
  update () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.update');
    let self  = this,
        chart = this.chart;
    
    // update the block clip path with the latest width
    chart.contributorClipPath.select('rect')
        .attr('width', chart.sprintBodyWidth);
    
    self.calculateBlockHeights();
    
    // Service the effort blocks
    self.insertEffortBlocks();
    self.removeEffortBlocks();
    self.updateEffortBlocks();
    
    // Service the contributor blocks
    self.insertContributorBlocks();
    self.updateContributorBlocks();
    self.removeContributorBlocks();
  }
  
  /**
   * Select all of the existing effort blocks
   */
  updateEffortBlockSelection () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.updateEffortBlockSelection');
    let self  = this,
        chart = this.chart;
    
    self.effortBlockSelection = chart.sprintBodyLayer.selectAll('.sprint-body-group')
        .selectAll('.effort-block-group')
        .data((sprint) => {
          return sprint.effortBlocks
        }, (d) => {
          return d._id
        });
  }
  
  /**
   * Insert any new effort blocks
   */
  insertEffortBlocks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.insertEffortBlocks');
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
        });
    
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
          
          if (chart.inContributorDrag) {
            chart.drag.hover = {
              type   : CapacityPlanBlockTypes.effort,
              record : d,
              element: element
            };
          }
        })
        .on('mouseleave', (d) => {
          let element = d3.select(d3.event.target);
          
          element.classed('hover', false);
          if (chart.inContributorDrag) {
            delete chart.drag.hover;
          }
        });
    
    effortBlockEnter.append('text')
        .attr('class', 'effort-title')
        .attr('x', chart.config.efforts.padding)
        .attr('y', chart.config.contributors.height);
    
    // Add controls for this effort
    let effortControlsEnter = effortBlockEnter.append('g')
        .attr('class', 'effort-controls');
    
    let removeButtonEnter = effortControlsEnter.append('g')
        .attr('class', 'effort-control effort-control-remove')
        .attr('transform', 'translate(-' + (controlRadius + chart.config.efforts.padding) + ', 0)')
        .on('click', (effort) => {
          let contributorList = effort.children().map((child) => {
            return child.dataId
          });
          effort.remove();
          contributorList.forEach((contributor) => {
            chart.data.option.healContributorLinks(contributor._id);
          });
        });
    
    removeButtonEnter.append('circle')
        .attr('class', 'effort-control-background')
        .attr('r', controlRadius);
    
    removeButtonEnter.append('text')
        .attr('x', controlTextX)
        .attr('y', controlTextY)
        .text('\u00D7');
    
    let upButtonEnter = effortControlsEnter.append('g')
        .attr('class', 'effort-control effort-control-up')
        .on('click', (effort) => {
          effort.moveUp();
        });
    
    upButtonEnter.append('circle')
        .attr('class', 'effort-control-background')
        .attr('r', controlRadius);
    
    upButtonEnter.append('text')
        .attr('x', controlTextX)
        .attr('y', controlTextY)
        .text('\u2191');
    
    let downButtonEnter = effortControlsEnter.append('g')
        .attr('class', 'effort-control effort-control-down')
        .attr('transform', 'translate(-' + (3 * controlRadius + 2 * chart.config.efforts.padding) + ', 0)')
        .on('click', (effort) => {
          effort.moveDown();
        });
    
    downButtonEnter.append('circle')
        .attr('class', 'effort-control-background')
        .attr('r', controlRadius);
    
    downButtonEnter.append('text')
        .attr('x', controlTextX)
        .attr('y', controlTextY)
        .text('\u2193');
    
    // Append the block body group
    effortBlockEnter.append('g')
        .attr('class', 'effort-block-body')
        .attr('transform', (d) => {
          return 'translate(0, ' + d.headerHeight + ')'
        });
  }
  
  /**
   * Update all effort blocks
   */
  updateEffortBlocks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.updateEffortBlocks');
    let self  = this,
        chart = this.chart;
    
    self.updateEffortBlockSelection();
    
    // Position the controls
    self.effortBlockSelection.select('.effort-controls')
        .attr('transform', (effort) => {
          return 'translate(' + chart.sprintBodyWidth + ', 3)'
        });
    
    self.effortBlockSelection.select('.effort-control-up')
        .classed('hide', (effort) => {
          // Hide the up button if this is the first
          return effort.order === 0;
        })
        .attr('transform', (effort) => {
          let buttonNumber = effort.order < effort.siblingCount() - 1 ? 3 : 2;
          return 'translate(-' + ((buttonNumber * 2 - 1) * controlRadius + buttonNumber * chart.config.efforts.padding) + ', 0)';
        });
    
    self.effortBlockSelection.select('.effort-control-down')
        .classed('hide', (effort) => {
          // Hide the down button if this is the last in the list
          return effort.order === effort.siblingCount() - 1;
        });
    
    // Reposition and size the effort block groups
    self.effortBlockSelection.select('.effort-block')
        .attr('height', (d) => {
          return d.height
        })
        .attr('width', chart.sprintBodyWidth)
        .style('fill', (d) => {
          return d.dataRecord().color
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
          return 'translate(0, ' + d.headerHeight + ')'
        });
    
    // Animate the repositioning
    self.effortBlockSelection.transition()
        .duration(500)
        .on('end', () => {
          chart.linkHandler.update();
        })
        .attr('transform', self.positionEffortBlock.bind(self));
    
    // Update the links in sync with the transition
    let startTime          = Date.now();
    let linkUpdateInterval = setInterval(() => {
      if (Date.now() - startTime < 500) {
        chart.linkHandler.update();
      } else {
        clearInterval(linkUpdateInterval);
      }
    }, 30);
  }
  
  /**
   * Remove any unneeded effort blocks
   */
  removeEffortBlocks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.removeEffortBlocks');
    let self  = this,
        chart = this.chart;
    
    self.effortBlockSelection.exit().remove();
  }
  
  /**
   * Select all of the existing contributor blocks
   */
  updateContributorBlockSelection () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.updateContributorBlockSelection');
    let self  = this,
        chart = this.chart;
    
    // Draw the contributor blocks
    self.contributorBlockSelection = chart.sprintBodyLayer.selectAll('.sprint-body-group')
        .selectAll('.effort-block-group')
        .select('.effort-block-body')
        .selectAll('.contributor-block-group')
        .data((effort) => {
          return effort.contributorBlocks
        }, (d) => {
          return d._id
        });
  }
  
  /**
   * Insert any new contributor blocks
   */
  insertContributorBlocks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.insertContributorBlocks');
    let self  = this,
        chart = this.chart;
    
    self.updateContributorBlockSelection();
    
    let contributorBlockEnter = self.contributorBlockSelection.enter()
        .append('g')
        .attr('class', 'contributor-block-group')
        .attr('data-block-id', (d) => {
          return d._id
        })
        .attr('data-contributor-id', (d) => {
          return d.dataId
        })
        .attr('data-target-id', (d) => {
          return d._id
        })
        .on('mouseenter', (d) => {
          if (!chart.inContributorDrag) {
            chart.svg.selectAll('.contributor-highlight[data-contributor-id="' + d.dataId + '"]').classed('highlight', true)
          }
        })
        .on('mouseleave', (d) => {
          chart.svg.selectAll('.contributor-highlight[data-contributor-id="' + d.dataId + '"]').classed('highlight', false)
        });
    
    contributorBlockEnter.append('rect')
        .attr('class', 'contributor-block')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', chart.sprintBodyWidth)
        .attr('height', chart.config.contributors.height)
        .on('mouseenter', (d) => {
          let element = d3.select(d3.event.target);
          
          if (chart.inContributorDrag) {
            element.classed('hover', true);
            chart.drag.hover = {
              type   : CapacityPlanBlockTypes.effort,
              record : d,
              element: element
            };
          }
        })
        .on('mouseleave', (d) => {
          let element = d3.select(d3.event.target);
          
          element.classed('hover', false);
          if (chart.inContributorDrag) {
            delete chart.drag.hover;
          }
        });
    
    contributorBlockEnter.append('path')
        .attr('class', 'contributor-background-path contributor-highlight')
        .attr('data-contributor-id', (d) => {
          return d.dataId
        })
        .attr('d', 'm0 ' + (chart.config.contributors.height / 2) + ' l' + (chart.sprintBodyWidth) + ' 0');
    
    let contributorContentEnter = contributorBlockEnter.append('g')
        .attr('class', 'contributor-block-content-group')
        .attr('clip-path', 'url(#' + chart.contributorClipPathId + ')');
    
    contributorContentEnter.append('text')
        .attr('class', 'contributor-name')
        .attr('x', chart.config.efforts.padding)
        .attr('y', chart.config.contributors.height * 0.25)
        .text((d) => {
          return d.name
        });
    
    // Add link drag control
    self.controlHandler.insert(contributorBlockEnter);
    
    // Add a button to remove this contributor
    let contributorRemoveButtonEnter = contributorBlockEnter.append('g')
        .attr('class', 'contributor-controls')
        .append('g')
        .attr('class', 'contributor-control contributor-control-remove')
        .attr('transform', 'translate(-' + (controlRadius) + ', ' + (chart.config.contributors.height / 2) + ')')
        .on('click', (block) => {
          block.remove();
          chart.data.option.healContributorLinks(block.dataId);
          chart.svg.selectAll('.contributor-highlight[data-contributor-id="' + block.dataId + '"]').classed('highlight', false)
        });
    
    contributorRemoveButtonEnter.append('circle')
        .attr('class', 'contributor-control-background')
        .attr('r', controlRadius);
    
    contributorRemoveButtonEnter.append('text')
        .attr('x', controlTextX)
        .attr('y', controlTextY)
        .text('\u00D7');
    
  }
  
  /**
   * Update all contributor blocks
   */
  updateContributorBlocks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.updateContributorBlocks');
    let self  = this,
        chart = this.chart;
    
    self.updateContributorBlockSelection();
    
    self.contributorBlockSelection.attr('transform', self.positionContributorBlock.bind(self))
        .select('.contributor-block')
        .attr('width', chart.sprintBodyWidth);
    
    self.contributorBlockSelection.select('.contributor-background-path')
        .attr('d', 'm0 ' + (chart.config.contributors.height / 2) + ' l' + (chart.sprintBodyWidth) + ' 0');
    
    self.contributorBlockSelection.select('.contributor-drag-group')
        .attr('transform', 'translate(' + chart.sprintBodyWidth + ', ' + (chart.config.contributors.height / 2) + ')');
  }
  
  /**
   * Remove any unneeded contributor blocks
   */
  removeContributorBlocks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.removeContributorBlocks');
    let self  = this,
        chart = this.chart;
    
    self.contributorBlockSelection.exit().remove();
  }
  
  /**
   * Calculate the height of the blocks
   */
  calculateBlockHeights () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.calculateBlockHeights');
    let chart = this.chart;
    
    // Size all of the blocks
    chart.maxSprintHeight = 0;
    chart.data.sprints.forEach((sprint) => {
      let dy = 0;
      sprint.effortBlocks.forEach((effortBlock) => {
        // Size the title so the height can be accurate
        let titleTemp = chart.offscreenLayer.append('text')
            .attr('class', 'effort-title')
            .attr('data-effort-id', effortBlock._id)
            .text(effortBlock.title);
        
        let originalBounds = titleTemp.node().getBoundingClientRect();
        titleTemp.call(Util.wrapSvgText, d3, chart.sprintBodyWidth - (2 * chart.config.efforts.padding));
        
        let lineCount = chart.offscreenLayer.select('.effort-title[data-effort-id="' + effortBlock._id + '"]').selectAll('tspan')
            .nodes().length;
        
        if (lineCount > 1) {
          effortBlock.headerHeight = (chart.config.contributors.height * 0.8) * lineCount + chart.config.efforts.padding;
        } else {
          effortBlock.headerHeight = chart.config.efforts.padding * 2 + chart.config.contributors.height;
        }
        
        // Calculate the height
        effortBlock.bodyHeight = effortBlock.contributorBlocks.length * (chart.config.contributors.height + chart.config.efforts.padding) + chart.config.efforts.padding;
        effortBlock.height     = effortBlock.headerHeight + effortBlock.bodyHeight;
        
        // Position the block
        effortBlock.y = dy;
        dy += effortBlock.height + chart.config.efforts.margin;
        
        return effortBlock
      });
      
      if (dy > chart.maxSprintHeight) {
        chart.maxSprintHeight = dy;
      }
    });
    chart.maxSprintHeight += chart.config.efforts.padding + chart.config.efforts.margin;
    
    // Cleanup the offscreen layer
    chart.offscreenLayer.selectAll('text').remove();
  }
  
  positionEffortBlock (block) {
    let chart = this.chart;
    return 'translate(0, ' + (chart.config.efforts.margin + block.y) + ')'
  }
  
  positionContributorBlock (block) {
    let chart = this.chart;
    return 'translate(0, ' + (chart.config.efforts.padding + block.parentIndex * (chart.config.contributors.height + chart.config.efforts.padding)) + ')'
  }
}