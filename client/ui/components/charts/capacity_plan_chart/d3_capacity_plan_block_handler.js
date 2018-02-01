import { Util } from '../../../../../imports/api/util';
import { CapacityPlanBlockTypes } from '../../../../../imports/api/capacity_plans/capacity_plan_block_types';
import { D3ContributorDragControlHandler } from './d3_contributor_drag_control_handler';
import { Session } from "meteor/session";

let d3            = require('d3'),
    d3Drag        = require('d3-drag'),
    controlTextX  = 0,
    controlTextY  = 0,
    controlRadius = 10,
    debug         = false,
    trace         = true;

export class D3CapacityPlanBlockHandler {
  /**
   * D3CapacityPlanBlockHandler takes care of constructing and updating the capacity plan blocks
   * @param chart
   */
  constructor (chart) {
    let self = this;
    
    self.chart          = chart;
    self.controlHandler = new D3ContributorDragControlHandler(chart, self);
    self.lastUpdateTime = 0;
    
    // Create the drag behavior for the effort links
    self.effortLinkDrag = d3Drag.drag()
        .on('start', self.effortLinkDragStart.bind(self))
        .on('drag', self.effortLinkDragged.bind(self))
        .on('end', self.effortLinkDragEnd.bind(self));
    
    // Create the drag behavior for the efforts
    self.effortDrag = d3Drag.drag()
        .on('start', self.effortDragStart.bind(self))
        .on('drag', self.effortDragged.bind(self))
        .on('end', self.effortDragEnd.bind(self));
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
    
    self.calculateBlockSizes();
    
    // Service the effort blocks
    self.insertEffortBlocks();
    self.removeEffortBlocks();
    self.updateEffortBlocks();
    
    // Service the contributor blocks
    self.insertContributorBlocks();
    self.updateContributorBlocks();
    self.removeContributorBlocks();
    
    // Service the release blocks
    self.insertReleaseBlocks();
    self.updateReleaseBlocks();
    self.removeReleaseBlocks();
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
        })
        .call(self.effortDrag);
    
    let effortDragEnter = effortBlockEnter.append('g')
        .attr('class', 'effort-drag-group');
    
    effortDragEnter.append('rect')
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
    
    effortDragEnter.append('text')
        .attr('class', 'effort-title')
        .attr('x', chart.config.efforts.padding)
        .attr('y', chart.config.contributors.height);
    
    // Place a drag control to add this effort to a release
    let dragGroupEnter = effortBlockEnter.append('g')
        .attr('class', 'link-drag-group')
        .attr('data-source-id', (d) => {
          return d._id
        });
    
    dragGroupEnter.append('g').attr('class', 'link-drag-link-container');
    
    let dragContainerEnter = dragGroupEnter.append('g')
        .attr('class', 'link-drag-handle-container')
        .call(self.effortLinkDrag);
    
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
    
    // Add controls for this effort
    let effortControlsEnter = effortBlockEnter.append('g')
        .attr('class', 'effort-controls');
    
    let removeButtonEnter = effortControlsEnter.append('g')
        .attr('class', 'effort-control effort-control-remove')
        .attr('transform', 'translate(-' + (2 * controlRadius + 1 * chart.config.efforts.padding) + ', 0)')
        .on('click', (block) => {
          // Grab some context
          let contributorList = block.children().map((child) => {
                return child.dataId
              }),
              effortId        = block.dataId;
          
          // Heal any release links before this block is removed
          chart.data.option.healReleaseLinks(effortId, block._id);
          
          // Remove the block
          block.remove();
          
          // Heal any contributor links
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
        .attr('transform', 'translate(-' + (3 * controlRadius + 2 * chart.config.efforts.padding) + ', 0)')
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
        .attr('transform', 'translate(-' + (4 * controlRadius + 3 * chart.config.efforts.padding) + ', 0)')
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
    self.effortBlockSelection.select('.link-drag-group')
        .attr('transform', (effort) => {
          return 'translate(' + chart.sprintBodyWidth + ', ' + (controlRadius * 2 + chart.config.efforts.padding) + ')'
        });
    
    // Don't show the link to add to a release if this is already part of a release
    self.effortBlockSelection.select('.link-drag-handle-container')
        .classed('no-mouse', (d) => {
          return !d.showReleaseControls
        })
        .style('opacity', (d) => {
          return d.showReleaseControls ? 1 : 0
        });
    
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
          if (effort.order < effort.siblingCount() - 1) {
            return 'translate(-' + (7 * controlRadius + 3 * chart.config.efforts.padding) + ', 0)'
          } else {
            return 'translate(-' + (4 * controlRadius + 3 * chart.config.efforts.padding) + ', 0)'
          }
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
        chart.linkHandler.updateContributorLinks();
        chart.linkHandler.updateReleaseLinks();
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
          console.log('Remove contributor block:', block);
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
    
    self.contributorBlockSelection.select('.link-drag-group')
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
   * Select all of the existing effort blocks
   */
  updateReleaseBlockselection () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.updateReleaseBlockselection');
    let self  = this,
        chart = this.chart;
    
    self.releaseBlockselection = chart.sprintBodyLayer.selectAll('.release-block-group')
        .data(chart.data.releases, (d) => {
          return d._id
        });
  }
  
  /**
   * Insert any new effort blocks
   */
  insertReleaseBlocks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.insertReleaseBlocks');
    let self  = this,
        chart = this.chart;
    
    self.updateReleaseBlockselection();
    
    let releaseBlockEnter = self.releaseBlockselection.enter()
        .append('g')
        .attr('class', 'release-block-group')
        .attr('transform', self.positionReleaseBlock.bind(self))
        .attr('data-block-id', (d) => {
          return d._id
        })
        .attr('data-release-id', (d) => {
          return d.dataId
        })
        .attr('data-target-id', (d) => {
          return d._id
        });
    
    releaseBlockEnter.append('rect')
        .attr('class', 'release-block')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', chart.config.releases.width)
        .on('mouseenter', (d) => {
          let element = d3.select(d3.event.target);
          element.classed('hover', true);
          
          if (chart.inEffortLinkDrag) {
            chart.drag.hover = {
              type   : CapacityPlanBlockTypes.release,
              record : d,
              element: element
            };
          } else {
            // Highlight the items in this release
            d.targetLinks().forEach((link) => {
              let effortId = link.source().dataId;
              chart.sprintBodyLayer.selectAll('.effort-block-group[data-effort-id="' + effortId + '"]').classed('effort-highlight', true);
            });
            chart.linkLayer.selectAll('.release-highlight[data-release-id="' + d.dataId + '"]').classed('highlight', true);
          }
        })
        .on('mouseleave', (d) => {
          let element = d3.select(d3.event.target);
          
          element.classed('hover', false);
          if (chart.inEffortLinkDrag) {
            delete chart.drag.hover;
          } else {
            chart.sprintBodyLayer.selectAll('.effort-block-group').classed('effort-highlight', false);
            chart.linkLayer.selectAll('.release-highlight[data-release-id="' + d.dataId + '"]').classed('highlight', false);
          }
        });
    
    releaseBlockEnter.append('text')
        .attr('class', 'release-title')
        .attr('x', chart.config.releases.padding)
        .attr('y', -chart.config.releases.padding)
        .attr('transform', 'rotate(90)');
    
    // Add controls for this effort
    let releaseControlsEnter = releaseBlockEnter.append('g')
        .attr('class', 'release-controls');
    
    let upButtonEnter = releaseControlsEnter.append('g')
        .attr('class', 'effort-control effort-control-up')
        .attr('transform', 'translate(' + chart.config.releases.width + ', ' + (chart.config.efforts.padding) + ')')
        .on('click', (block) => {
          block.moveUp();
        });
    
    upButtonEnter.append('circle')
        .attr('class', 'effort-control-background')
        .attr('r', controlRadius);
    
    upButtonEnter.append('text')
        .attr('x', controlTextX)
        .attr('y', controlTextY)
        .text('\u2191');
    
    let downButtonEnter = releaseControlsEnter.append('g')
        .attr('class', 'effort-control effort-control-down')
        .attr('transform', 'translate(' + chart.config.releases.width + ', ' + (2 * controlRadius + 2 * chart.config.efforts.padding) + ')')
        .on('click', (block) => {
          block.moveDown();
        });
    
    downButtonEnter.append('circle')
        .attr('class', 'effort-control-background')
        .attr('r', controlRadius);
    
    downButtonEnter.append('text')
        .attr('x', controlTextX)
        .attr('y', controlTextY)
        .text('\u2193');
  }
  
  /**
   * Update all effort blocks
   */
  updateReleaseBlocks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.updateReleaseBlocks');
    let self  = this,
        chart = this.chart;
    
    self.updateReleaseBlockselection();
    
    // Position the controls
    self.releaseBlockselection.select('.effort-control-up')
        .classed('hide', (block) => {
          // Hide the up button if this is the first
          return block.order === 0;
        });
    
    self.releaseBlockselection.select('.effort-control-down')
        .classed('hide', (block) => {
          // Hide the down button if this is the last in the list
          return block.order === block.siblingCount() - 1;
        });
    
    // Reposition and size the effort block groups
    self.releaseBlockselection.select('.release-block')
        .attr('height', (d) => {
          return Math.max(d.titleLength, chart.config.releases.height) + 2 * chart.config.releases.padding
        });
    
    // Update the effort title
    self.releaseBlockselection.select('.release-title')
        .text((d) => {
          return d.title
        });
    
    // Animate the repositioning
    self.releaseBlockselection.transition()
        .duration(500)
        .on('end', () => {
          chart.linkHandler.update();
        })
        .attr('transform', self.positionReleaseBlock.bind(self));
  }
  
  /**
   * Remove any unneeded effort blocks
   */
  removeReleaseBlocks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.removeReleaseBlocks');
    let self  = this,
        chart = this.chart;
    
    self.releaseBlockselection.exit().remove();
  }
  
  /**
   * Calculate the height of the blocks
   */
  calculateBlockSizes () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.calculateBlockSizes');
    let chart = this.chart;
    
    // Size all of the blocks
    chart.maxSprintHeight = 0;
    chart.data.sprints.forEach((sprint) => {
      // Groom the effort blocks
      let dy = 0;
      sprint.effortBlocks.forEach((effortBlock) => {
        // Size the title so the height can be accurate
        let titleTemp = chart.offscreenLayer.append('text')
            .attr('class', 'effort-title')
            .attr('data-effort-id', effortBlock._id)
            .text(effortBlock.title);
        
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
    
    // Size the release blocks
    chart.data.releases.forEach((releaseBlock) => {
      let titleTemp = chart.offscreenLayer.append('text')
          .attr('class', 'release-title')
          .attr('data-release-id', releaseBlock._id)
          .text(releaseBlock.title);
      
      releaseBlock.titleLength = titleTemp.node().getBoundingClientRect().width;
    });
    
    // Position the release blocks
    chart.data.sprints.forEach((sprint) => {
      let sprintReleases = chart.data.releases.filter((releaseBlock) => {
        return releaseBlock.sprintNumber === sprint.sprintNumber
      });
      
      // Make sure the blocks are ordered correctly
      sprintReleases.sort((releaseBlock) => {
        return releaseBlock.order
      }).forEach((releaseBlock, i) => {
        if (releaseBlock.order !== i) {
          // Fix the order
          chart.data.sprints[ releaseBlock.index ].order = releaseBlock.order = i;
          releaseBlock.updateOrder(i);
        }
      });
      
      // position the blocks
      let dy = 0;
      sprintReleases.sort((releaseBlock) => {
        return releaseBlock.order
      }).forEach((releaseBlock, i) => {
        chart.data.sprints[ releaseBlock.index ].y = releaseBlock.y = dy;
        dy += Math.max(releaseBlock.titleLength, chart.config.releases.height) + 2 * chart.config.releases.padding + chart.config.efforts.margin;
      })
    });
    
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
  
  positionReleaseBlock (block) {
    let chart    = this.chart,
        baseline = Math.min(block.sprintNumber + 1, chart.data.sprints.length) * chart.sprintWidth;
    return 'translate(' + (baseline + (chart.linkSectionWidth / 2) - (chart.config.contributors.height / 2)) + ', ' + block.y + ')'
  }
  
  /**
   * Handle a link drag starting
   * @param d
   */
  effortLinkDragStart (d) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.dragStart:', d);
    let self          = this,
        chart         = this.chart,
        dragHandle    = d3.select(d3.event.sourceEvent.target).closest('.link-drag-handle-container'),
        linkContainer = dragHandle.closest('.link-drag-group').select('.link-drag-link-container'),
        dragLink      = linkContainer.append('path').attr('class', 'link-drag-link');
    
    // Freeze out all contributor blocks and effort titles from pointer events
    chart.sprintBackgroundLayer.selectAll('.sprint-background-group').classed('no-mouse', true);
    chart.sprintBodyLayer.selectAll('.effort-block-group').classed('no-mouse', true);
    chart.sprintBodyLayer.selectAll('.contributor-block-group').classed('no-mouse', true);
    
    chart.bodyBounds = chart.chartBody.node().getBoundingClientRect();
    
    chart.drag = {
      dragHandle: dragHandle,
      dragLink  : dragLink,
      offsetY   : dragHandle.closest('.effort-block-group').node().getBoundingClientRect().y - chart.bodyBounds.y
    };
    
    chart.drag.dragHandle.classed('in-drag', true);
    chart.inEffortLinkDrag = true;
    
    trace && console.log('D3CapacityPlanBlockHandler.dragStart drag:', chart.drag)
  }
  
  /**
   * Handle a link drag moving
   * @param d
   */
  effortLinkDragged (d) {
    //trace && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.dragged:', d);
    let self  = this,
        chart = this.chart,
        dragX = d3.event.x,
        dragY = d3.event.y - chart.drag.offsetY;
    
    trace && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.dragged:', dragX, dragY);
    chart.drag.dragHandle.attr('transform', 'translate(' + dragX + ', ' + dragY + ')');
    
    chart.drag.dragLink.attr('d', chart.linker({ source: [ 0, 0 ], target: [ dragX, dragY ] }))
  }
  
  /**
   * Handle a link drag ending
   * @param d
   */
  effortLinkDragEnd (d) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.dragEnd:', d);
    let self  = this,
        chart = this.chart;
    
    chart.drag.dragHandle.classed('in-drag', false);
    chart.inEffortLinkDrag = false;
    
    chart.drag.dragLink.remove();
    
    chart.drag.dragHandle
        .transition()
        .duration(250)
        .attr('transform', 'translate(0,0)');
    
    // Un-freeze contributor blocks and effort titles from pointer events
    chart.sprintBackgroundLayer.selectAll('.sprint-background-group').classed('no-mouse', false);
    chart.sprintBodyLayer.selectAll('.effort-block-group').classed('no-mouse', false);
    chart.sprintBodyLayer.selectAll('.contributor-block-group').classed('no-mouse', false);
    
    // Check for a drop
    if (chart.drag.hover) {
      debug && console.log('D3CapacityPlanBlockHandler.dragEnd potential drop:', chart.drag.hover);
      chart.drag.hover.element.classed('hover', false);
      
      if (chart.drag.hover.type === CapacityPlanBlockTypes.release) {
        let releaseBlock = chart.drag.hover.record;
        
        releaseBlock.addLink(d._id, d.sprintNumber, CapacityPlanBlockTypes.effort);
        
        // update the sprint number for this release
        let maxSprint = 0;
        releaseBlock.targetLinks().forEach((link) => {
          if (link.sourceSprint > maxSprint) {
            maxSprint = link.sourceSprint
          }
        });
        
        if (maxSprint !== releaseBlock.sprintNumber) {
          releaseBlock.updateSprintNumber(maxSprint);
        }
        
        // Heal the release links for this effort
        chart.data.option.healReleaseLinks(d.dataId);
      }
    }
    
    delete chart.drag
  }
  
  /**
   * Handle a link drag starting
   * @param effortBlock
   */
  effortDragStart (effortBlock) {
    // If the event was sourced in a control, cancel it
    if(d3.select(d3.event.sourceEvent.target).closest('.effort-drag-group').empty()){
      return
    }
    debug && console.log(Util.timestamp(), 'D3CapacityPlanEffortListHandler.dragStart:', effortBlock);
    
    let self        = this,
        chart       = this.chart,
        dragElement = d3.select(d3.event.sourceEvent.target).closest('.effort-block-group');
    
    Session.set('in-effort-drag', true);
    
    // Freeze out all contributor blocks and effort titles from pointer events
    chart.baseLayer.select('.sprint-background-group[data-sprint-number="' + effortBlock.sprintNumber + '"]').classed('no-mouse', true);
    chart.sprintBodyLayer.selectAll('.effort-block-group').classed('no-mouse', true);
    chart.sprintBodyLayer.selectAll('.contributor-block-group').classed('no-mouse', true);
    chart.linkLayer.style('opacity', 0);
    
    chart.drag = {
      dragElement: dragElement,
      offsetX    : d3.event.x - chart.config.efforts.margin,
      offsetY    : 0
    };
    
    chart.drag.dragElement.classed('in-drag', true);
    
    trace && console.log('D3CapacityPlanEffortListHandler.dragStart drag:', d3.event, chart.drag)
  }
  
  /**
   * Handle a link drag moving
   * @param effortBlock
   */
  effortDragged (effortBlock) {
    // If not in a drag ignore the event
    if(!this.chart.drag){
      return
    }
    
    //trace && console.log(Util.timestamp(), 'D3CapacityPlanBlockHandler.dragged:', effortBlock);
    let self  = this,
        chart = this.chart,
        dragX = d3.event.x - chart.drag.offsetX,
        dragY = d3.event.y - chart.drag.offsetY;
    
    trace && console.log(Util.timestamp(), 'D3CapacityPlanEffortListHandler.dragged:', dragX, dragY);
    chart.drag.dragElement.attr('transform', 'translate(' + dragX + ', ' + dragY + ')');
  }
  
  /**
   * Handle a link drag ending
   * @param effortBlock
   */
  effortDragEnd (effortBlock) {
    // If not in a drag ignore the event
    if(!this.chart.drag){
      return
    }
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanEffortListHandler.dragEnd:', effortBlock);
    let self         = this,
        chart        = this.chart,
        sprintNumber = Session.get('hover-sprint-number');
    
    chart.drag.dragElement.classed('in-drag', false);
    Session.set('in-effort-drag', false);
    
    chart.drag.dragElement
        .transition()
        .duration(250)
        .attr('transform', self.positionEffortBlock(effortBlock));
    
    // Un-freeze contributor blocks and effort titles from pointer events
    chart.baseLayer.select('.sprint-background-group[data-sprint-number="' + effortBlock.sprintNumber + '"]').classed('no-mouse', false);
    chart.sprintBodyLayer.selectAll('.effort-block-group').classed('no-mouse', false);
    chart.sprintBodyLayer.selectAll('.contributor-block-group').classed('no-mouse', false);
    chart.linkLayer.style('opacity', 1);
    
    if (_.isNumber(sprintNumber)) {
      let existingBlock = chart.data.option.sprintBlock(sprintNumber, effortBlock.dataId);
      
      // Make sure that this doesn't already exist in this sprint
      if (!existingBlock) {
        effortBlock.updateSprintNumber(sprintNumber);
        effortBlock.reIndexSiblingOrder();
      } else {
        console.error('Sprint', sprintNumber, 'already has a block for the effort', effortBlock.title, effortBlock._id);
      }
      
      Session.set('hover-sprint-number', null);
    }
    
    delete chart.drag
  }
}