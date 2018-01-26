import { Session } from 'meteor/session';
import { Util } from '../../../../../imports/api/util';
import { CapacityPlanBlockTypes } from '../../../../../imports/api/capacity_plan/capacity_plan_block_types';
import './d3_closest';

let d3    = require('d3'),
    debug = true,
    trace = false;

//require('./d3_closest');

export class D3CapacityPlanChart {
  constructor (containerId, config) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart creating new chart:', containerId, config);
    
    // Keep track of the container element id
    this.containerId = containerId;
    
    // Merge the passed config with the default config
    this.config = _.extend({
      contributors: {
        height: 25,
        width : 120
      },
      teams       : {
        padding: 8
      },
      timeline    : {
        height: 50
      },
      sprints     : {
        width: 400
      },
      efforts     : {
        minHeight: 20,
        padding  : 5,
        margin   : 10
      },
      margin      : {
        top   : 5,
        right : 5,
        bottom: 5,
        left  : 5
      }
    }, config);
  }
  
  /**
   * Generate the chart with some data
   * @param data
   */
  generate (data) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.generate:', this.containerId);
    let self           = this,
        containerWidth = $('#' + self.containerId).width();
    
    // Generate the chart
    self.svg = d3.select('#' + self.containerId)
        .append('svg')
        .attr('class', 'capacity-plan-chart')
        .style('width', '100%')
        .style('height', parseInt(containerWidth * 0.3333) + 'px');
    
    // Create a section for defining clip paths
    self.svgDefs = self.svg.append('defs');
    
    self.baseLayer = self.svg.append('g')
        .attr('class', 'base-layer')
        .attr('transform', 'translate(' + self.config.margin.left + ',' + self.config.margin.top + ')');
    
    // Create a layer for the timeline
    self.timelineLayer = self.baseLayer.append('g')
        .attr('class', 'timeline-layer');
    
    // Create a layer for the chart body
    self.chartBody = self.baseLayer.append('g')
        .attr('class', 'chart-body');
    
    // Create a layer for the timeline
    self.sprintBackgroundLayer = self.chartBody.append('g')
        .attr('class', 'sprint-background-layer');
    
    // Create a layer for the links
    self.linkLayer = self.chartBody.append('g')
        .attr('class', 'link-layer');
    
    // Create a layer for the timeline
    self.sprintBodyLayer = self.chartBody.append('g')
        .attr('class', 'sprint-body-layer');
    
    // Create a layer for the time blocks
    self.chartHighlightLayer = self.chartBody.append('g')
        .attr('class', 'chart-highlight-layer');
    
    // Create a layer for the contributor layer
    self.contributorLayer = self.baseLayer.append('g')
        .attr('class', 'contributor-layer')
        .attr('transform', 'translate(0,' + self.config.timeline.height + ')');
    
    // Create a y-axis separator
    self.yAxisSeparator = self.chartBody.append('line')
        .attr('class', 'y-axis-separator')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 1)
        .attr('y2', 1);
    
    // Create a clip path for contributor names
    self.contributorClipPathId = 'contributorName-' + self.containerId;
    self.contributorClipPath   = self.svgDefs.append('clipPath')
        .attr('id', self.contributorClipPathId);
    
    self.contributorClipPath.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', self.config.contributors.width)
        .attr('height', self.config.contributors.height);
    
    // Create an offscreen layer for measuring text width
    self.offscreenLayer = self.svg.append('g')
        .attr('class', 'offscreen-layer')
        .attr('transform', 'translate(-10000, -10000)');
    
    // Create a drag handler for use creating links
    self.linkDragHandler = d3.drag()
        .on('start', self.linkDragStart.bind(self))
        .on('drag', self.linkDragged.bind(self))
        .on('end', self.linkDragEnd.bind(self));
    
    self.linker = d3.linkHorizontal();
    
    // Draw the data
    self.update(data);
  }
  
  /**
   * Update the chart with new data
   * @param data
   */
  update (data) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.update:', this.containerId);
    let self      = this,
        startTime = Date.now();
    
    self.parseData(data);
    
    self.updateContributors();
    
    self.updateSprints();
    
    self.updateSprintBlocks();
    
    self.updateTimeline();
    
    // Center the contributors vertically
    if (self.contributorsHeight < self.maxSprintHeight) {
      self.contributorLayer.attr('transform', 'translate(0, ' + (self.config.timeline.height + (self.maxSprintHeight - self.contributorsHeight) / 2) + ')')
    } else {
      self.contributorLayer.attr('transform', 'translate(0, ' + self.config.timeline.height + ')')
    }
    
    // Update the yAxis separator
    self.yAxisSeparator
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', Math.max(self.contributorsHeight, self.maxSprintHeight));
    
    // Update the links
    self.updateContributorLinks();
    for (let i = 1; i < 5; i++) {
      setTimeout(() => {
        self.updateContributorLinks();
      }, i * 15)
    }
    
    // Resize to fit the content
    self.svg.style('height', (Math.max(self.contributorsHeight, self.maxSprintHeight) + self.config.margin.top + self.config.margin.bottom + self.config.timeline.height) + 'px');
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.update completed:', Date.now() - startTime);
  }
  
  /**
   * Update the chart's x axis timeline
   */
  updateTimeline () {
    trace && console.log(Util.timestamp(), 'D3CapacityPlanChart.updateTimeline:', this.containerId);
    let self      = this,
        startTime = Date.now();
    
    // Position the timeline
    self.timelineLayer.attr('transform', 'translate(' + self.bodyLeft + ', 0)');
    
    // Update the sprint titles
    let sprintTitleSelection = self.timelineLayer.selectAll('.sprint-header-group')
        .data(self.data.sprints, (d) => {
          return d._id
        });
    
    sprintTitleSelection.exit().remove();
    
    let sprintTitleEnter = sprintTitleSelection.enter()
        .append('g')
        .attr('class', 'sprint-header-group');
    
    sprintTitleEnter.append('text')
        .attr('class', 'sprint-header-date')
        .attr('y', 25);
    
    sprintTitleEnter.append('text')
        .attr('class', 'sprint-header-title')
        .attr('y', 45);
    
    // Place the title groups and update the text
    self.timelineLayer.selectAll('.sprint-header-group')
        .attr('transform', (sprint) => {
          return 'translate(' + (sprint.sprintNumber * self.sprintWidth + self.linkSectionWidth) + ',0)'
        })
        .select('.sprint-header-date')
        .text((sprint) => {
          return moment(sprint.start).format('ddd, MMM Do')
        });
    
    self.timelineLayer.selectAll('.sprint-header-group')
        .select('.sprint-header-title')
        .text((sprint) => {
          return sprint.title
        });
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.updateTimeline completed:', Date.now() - startTime);
  }
  
  /**
   * Update the sprint layout
   */
  updateSprints () {
    trace && console.log(Util.timestamp(), 'D3CapacityPlanChart.updateSprints:', this.containerId);
    let self      = this,
        startTime = Date.now();
    
    self.bodyWidth        = self.svg.node()
        .getBoundingClientRect().width - self.config.margin.left - self.config.margin.right - self.bodyLeft;
    self.sprintWidth      = parseInt(Math.min(self.bodyWidth / self.data.sprints.length, self.config.sprints.width));
    self.sprintBodyWidth  = self.namesWidth;
    self.linkSectionWidth = self.sprintWidth - self.sprintBodyWidth;
    
    // Update the sprint body content
    let sprintBackgroundSelection = self.sprintBackgroundLayer.selectAll('.sprint-background-group')
        .data(self.data.sprints, (d) => {
          return d._id
        });
    
    sprintBackgroundSelection.exit().remove();
    
    let sprintGroupEnter = sprintBackgroundSelection.enter()
        .append('g')
        .attr('class', 'sprint-background-group')
        .attr('data-sprint-id', (d) => {
          return d._id
        });
    
    sprintGroupEnter.append('rect')
        .attr('class', 'sprint-section sprint-link-section')
        .attr('x', 0)
        .attr('y', 0);
    
    sprintGroupEnter.append('rect')
        .attr('class', 'sprint-section sprint-body-section')
        .attr('x', self.linkSectionWidth)
        .attr('y', 0)
        .on('mouseenter', (d) => {
          let element = d3.select(d3.event.target);
          
          if (Session.get('in-effort-drag')) {
            element.classed('hover', true);
            Session.set('hover-sprint-number', d.sprintNumber);
          }
        })
        .on('mouseleave', (d) => {
          let element = d3.select(d3.event.target);
          element.classed('hover', false);
          
          if (Session.get('in-effort-drag')) {
            Session.set('hover-sprint-number', null);
          }
        });
    
    sprintGroupEnter.append('g')
        .attr('class', 'sprint-block-group');
    
    // Update the selection
    sprintBackgroundSelection = self.sprintBackgroundLayer.selectAll('.sprint-background-group');
    
    // Place the groups
    sprintBackgroundSelection.attr('transform', (sprint) => {
      return 'translate(' + (sprint.sprintNumber * self.sprintWidth) + ',0)'
    });
    
    // Size the timelines
    sprintBackgroundSelection.selectAll('.sprint-link-section')
        .attr('width', self.linkSectionWidth)
        .attr('height', Math.max(self.contributorsHeight, self.maxSprintHeight || 0));
    
    sprintBackgroundSelection.selectAll('.sprint-body-section')
        .attr('width', self.sprintBodyWidth)
        .attr('height', Math.max(self.contributorsHeight, self.maxSprintHeight || 0))
        .attr('x', self.linkSectionWidth);
    
    // Place the body groups
    let sprintBodySelection = self.sprintBodyLayer.selectAll('.sprint-body-group')
        .data(self.data.sprints, (d) => {
          return d._id
        });
    
    sprintBackgroundSelection.exit().remove();
    
    sprintBodySelection.enter().append('g')
        .attr('class', 'sprint-body-group');
    
    self.sprintBodyLayer.selectAll('.sprint-body-group')
        .attr('transform', (sprint) => {
          return 'translate(' + (sprint.sprintNumber * self.sprintWidth + self.linkSectionWidth) + ',0)'
        });
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.updateSprints completed:', Date.now() - startTime);
  }
  
  /**
   * Draw all of the blocks for the sprints
   */
  updateSprintBlocks () {
    trace && console.log(Util.timestamp(), 'D3CapacityPlanChart.updateSprintBlocks:', this.containerId);
    let self      = this,
        startTime = Date.now();
    
    // Size all of the blocks
    self.maxSprintHeight = 0;
    self.data.sprints.forEach((sprint) => {
      let dy = 0;
      sprint.effortBlocks.forEach((effortBlock) => {
        // Size the title so the height can be accurate
        let titleTemp = self.offscreenLayer.append('text')
            .attr('class', 'effort-title')
            .attr('data-effort-id', effortBlock._id)
            .text(effortBlock.title);
        
        let originalBounds = titleTemp.node().getBoundingClientRect();
        titleTemp.call(Util.wrapSvgText, d3, self.sprintBodyWidth - (2 * self.config.efforts.padding));
        
        let wrappedBounds = self.offscreenLayer.select('.effort-title[data-effort-id="' + effortBlock._id + '"]').node()
            .getBoundingClientRect();
        
        if (wrappedBounds.height > originalBounds.height) {
          effortBlock.headerHeight = (self.config.contributors.height - originalBounds.height) + wrappedBounds.height + self.config.efforts.padding;
        } else {
          effortBlock.headerHeight = self.config.efforts.padding * 2 + self.config.contributors.height;
        }
        
        // Calculate the height
        effortBlock.bodyHeight = effortBlock.contributorBlocks.length * (self.config.contributors.height + self.config.efforts.padding) + self.config.efforts.padding;
        effortBlock.height     = effortBlock.headerHeight + effortBlock.bodyHeight;
        
        // Position the block
        effortBlock.y = dy;
        dy += effortBlock.height + self.config.efforts.margin;
        
        return effortBlock
      });
      
      if (dy > self.maxSprintHeight) {
        self.maxSprintHeight = dy;
      }
    });
    self.maxSprintHeight += self.config.efforts.padding + self.config.efforts.margin;
    
    // Cleanup the offscreen layer
    self.offscreenLayer.selectAll('text').remove();
    
    // Resize the contributor block clip path rect
    self.contributorClipPath.select('rect')
        .attr('width', self.sprintBodyWidth);
    
    // Start with the effort blocks
    let effortBlockSelection = self.sprintBodyLayer.selectAll('.sprint-body-group').selectAll('.effort-block-group')
        .data((sprint) => {
          return sprint.effortBlocks
        }, (d) => {
          return d._id
        });
    
    effortBlockSelection.exit().remove();
    
    let effortBlockEnter = effortBlockSelection.enter().append('g')
        .attr('class', 'effort-block-group')
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
        .attr('width', self.sprintBodyWidth)
        .on('mouseenter', (d) => {
          let element = d3.select(d3.event.target);
          
          if (self.inContributorDrag) {
            element.classed('hover', true);
            self.drag.hover = {
              type   : CapacityPlanBlockTypes.effort,
              record : d,
              element: element
            };
          }
        })
        .on('mouseleave', (d) => {
          let element = d3.select(d3.event.target);
          
          element.classed('hover', false);
          if (self.inContributorDrag) {
            delete self.drag.hover;
          }
        });
    
    effortBlockEnter.append('text')
        .attr('class', 'effort-title')
        .attr('x', self.config.efforts.padding)
        .attr('y', self.config.contributors.height);
    
    // Add controls for this effort
    let effortControlsEnter = effortBlockEnter.append('g')
        .attr('class', 'effort-controls');
    
    let controlTextX  = 0,
        controlTextY  = 0,
        controlRadius = 10;
    
    let removeButtonEnter = effortControlsEnter.append('g')
        .attr('class', 'effort-control effort-control-remove')
        .attr('transform', 'translate(-' + (controlRadius + self.config.efforts.padding) + ', 0)')
        .on('click', (effort) => {
          let contributorList = effort.children().map((child) => {
            return child.dataId
          });
          effort.remove();
          contributorList.forEach((contributor) => {
            self.data.option.healContributorLinks(contributor._id);
          });
        });
    
    removeButtonEnter.append('circle')
        .attr('class', 'effort-control-background')
        .attr('r', controlRadius);
    
    removeButtonEnter.append('text')
        .attr('x', controlTextX)
        .attr('y', controlTextY)
        .text('x');
    
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
        .text('+');
    
    let downButtonEnter = effortControlsEnter.append('g')
        .attr('class', 'effort-control effort-control-down')
        .attr('transform', 'translate(-' + (3 * controlRadius + 2 * self.config.efforts.padding) + ', 0)')
        .on('click', (effort) => {
          effort.moveDown();
        });
    
    downButtonEnter.append('circle')
        .attr('class', 'effort-control-background')
        .attr('r', controlRadius);
    
    downButtonEnter.append('text')
        .attr('x', controlTextX)
        .attr('y', controlTextY)
        .text('-');
    
    // Position the controls
    self.sprintBodyLayer.selectAll('.effort-block-group')
        .select('.effort-controls')
        .attr('transform', (effort) => {
          return 'translate(' + self.sprintBodyWidth + ', 3)'
        });
    
    self.sprintBodyLayer.selectAll('.effort-block-group')
        .select('.effort-control-up')
        .classed('hide', (effort) => {
          // Hide the up button if this is the first
          return effort.order === 0;
        })
        .attr('transform', (effort) => {
          let buttonNumber = effort.order < effort.siblingCount() - 1 ? 3 : 2;
          return 'translate(-' + ((buttonNumber * 2 - 1) * controlRadius + buttonNumber * self.config.efforts.padding) + ', 0)';
        });
    
    self.sprintBodyLayer.selectAll('.effort-block-group')
        .select('.effort-control-down')
        .classed('hide', (effort) => {
          // Hide the down button if this is the last in the list
          return effort.order === effort.siblingCount() - 1;
        });
    
    // Append the block body group
    effortBlockEnter.append('g')
        .attr('class', 'effort-block-body')
        .attr('transform', (d) => {
          return 'translate(0, ' + d.headerHeight + ')'
        });
    
    // Reposition and size the effort block groups
    self.sprintBodyLayer.selectAll('.effort-block-group')
        .attr('transform', (d) => {
          return 'translate(0, ' + (self.config.efforts.margin + d.y) + ')'
        })
        .select('.effort-block')
        .attr('height', (d) => {
          return d.height
        })
        .attr('width', self.sprintBodyWidth)
        .style('fill', (d) => {
          return d.dataRecord().color
        });
    
    self.sprintBodyLayer.selectAll('.effort-block-group')
        .select('.effort-title')
        .text((d) => {
          return d.title
        })
        .call(Util.wrapSvgText, d3, self.sprintBodyWidth - (2 * self.config.efforts.padding));
    
    // Draw the contributor blocks
    let contributorBlockSelection = self.sprintBodyLayer.selectAll('.sprint-body-group')
        .selectAll('.effort-block-group')
        .select('.effort-block-body')
        .selectAll('.contributor-block-group')
        .data((effort) => {
          return effort.contributorBlocks
        }, (d) => {
          return d._id
        });
    
    contributorBlockSelection.exit().remove();
    
    let contributorBlockEnter = contributorBlockSelection.enter().append('g')
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
          if (!self.inContributorDrag) {
            self.svg.selectAll('.contributor-highlight[data-contributor-id="' + d.dataId + '"]').classed('highlight', true)
          }
        })
        .on('mouseleave', (d) => {
          self.svg.selectAll('.contributor-highlight[data-contributor-id="' + d.dataId + '"]').classed('highlight', false)
        });
    
    contributorBlockEnter.append('rect')
        .attr('class', 'contributor-block contributor-highlight')
        .attr('data-contributor-id', (d) => {
          return d.dataId
        })
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', self.sprintBodyWidth)
        .attr('height', self.config.contributors.height)
        .on('mouseenter', (d) => {
          let element = d3.select(d3.event.target);
          
          if (self.inContributorDrag) {
            element.classed('hover', true);
            self.drag.hover = {
              type   : CapacityPlanBlockTypes.effort,
              record : d,
              element: element
            };
          }
        })
        .on('mouseleave', (d) => {
          let element = d3.select(d3.event.target);
          
          element.classed('hover', false);
          if (self.inContributorDrag) {
            delete self.drag.hover;
          }
        });
    
    let contributorContentEnter = contributorBlockEnter.append('g')
        .attr('class', 'contributor-block-content-group')
        .attr('clip-path', 'url(#' + self.contributorClipPathId + ')');
    
    contributorContentEnter.append('text')
        .attr('class', 'contributor-name')
        .attr('x', self.config.efforts.padding)
        .attr('y', self.config.contributors.height * 0.25)
        .text((d) => {
          return d.name
        });
    
    // Add controls for this contributor
    let contributorRemoveButtonEnter = contributorBlockEnter.append('g')
        .attr('class', 'contributor-controls')
        .append('g')
        .attr('class', 'contributor-control contributor-control-remove')
        .attr('transform', 'translate(-' + (self.config.efforts.padding) + ', ' + (self.config.contributors.height / 2) + ')')
        .on('click', (block) => {
          block.remove();
          self.data.option.healContributorLinks(block.dataId);
          self.svg.selectAll('.contributor-highlight[data-contributor-id="' + block.dataId + '"]').classed('highlight', false)
        });
    
    contributorRemoveButtonEnter.append('circle')
        .attr('class', 'contributor-control-background')
        .attr('r', controlRadius);
    
    contributorRemoveButtonEnter.append('text')
        .attr('x', controlTextX)
        .attr('y', controlTextY)
        .text('x');
    
    // Create the drag handle
    let dragContainerEnter = contributorBlockEnter.append('g')
        .attr('class', 'contributor-drag-container')
        .attr('data-source-id', (d) => {
          return d._id
        });
    
    dragContainerEnter.append('g')
        .attr('class', 'contributor-drag-link-container');
    
    dragContainerEnter.append('circle')
        .attr('class', 'contributor-drag-handle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 7)
        .call(self.linkDragHandler);
    
    // Reposition and size the effort block groups
    self.sprintBodyLayer.selectAll('.contributor-block-group')
        .attr('transform', (d) => {
          return 'translate(0, ' + (self.config.efforts.padding + d.parentIndex * (self.config.contributors.height + self.config.efforts.padding)) + ')'
        })
        .select('.contributor-block')
        .attr('width', self.sprintBodyWidth);
    
    self.sprintBodyLayer.selectAll('.contributor-block-group')
        .select('.contributor-drag-container')
        .attr('transform', 'translate(' + self.sprintBodyWidth + ', ' + (self.config.contributors.height / 2) + ')');
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.updateSprintBlocks completed:', Date.now() - startTime);
  }
  
  /**
   * Update the team roster sections
   */
  updateContributors () {
    trace && console.log(Util.timestamp(), 'D3CapacityPlanChart.updateContributors:', this.containerId);
    let self      = this,
        startTime = Date.now();
    
    // Set the y position for the groups
    let dy          = 0,
        height,
        width;
    self.namesWidth = 0;
    self.data.teams.forEach((team) => {
      // Measure the width of the title
      self.offscreenLayer.append('text')
          .attr('id', '_' + team._id)
          .text(team.title);
      
      height = team.contributors.length * self.config.contributors.height + 2 * self.config.teams.padding;
      
      team.envelope = {
        x1    : 0,
        y1    : dy,
        x2    : self.config.margin.left + self.config.contributors.width,
        y2    : dy + height,
        height: height,
        width : self.offscreenLayer.select('#_' + team._id).node().getBoundingClientRect().width
      };
      
      team.contributors.forEach((contributor, i) => {
        // Measure the width of the title
        self.offscreenLayer.append('text')
            .attr('class', 'contributor-name')
            .attr('id', '_' + contributor._id)
            .text(contributor.name);
        
        width = self.offscreenLayer.select('#_' + contributor._id).node().getBoundingClientRect().width;
        
        contributor.envelope = {
          x1   : 0,
          y1   : i * self.config.contributors.height,
          x2   : width,
          y2   : (i + 1) * self.config.contributors.height,
          width: width
        };
        
        self.namesWidth = Math.max(width, self.namesWidth);
      });
      
      dy = team.envelope.y2;
    });
    self.contributorsHeight = Math.max(dy, 20);
    
    // Add some padding to the names and force it to a whole number of pixels
    self.namesWidth = Math.max(self.namesWidth, self.config.contributors.width);
    self.namesWidth += self.config.teams.padding * 2;
    self.namesWidth = parseInt(self.namesWidth);
    
    // Groom the team groups
    let teamSelection = self.contributorLayer.selectAll('.team-group')
        .data(self.data.teams, (team) => {
          return team._id
        });
    
    teamSelection.enter()
        .append('g')
        .attr('class', 'team-group')
        .attr('data-team-id', (d) => {
          return d._id
        });
    /*
        .append('rect')
        .attr('style', 'stroke:#f00; fill:none;')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', namesWidth)
        .attr('height', (d) => {
          return d.envelope.height
        });
        */
    
    teamSelection.exit().remove();
    
    self.contributorLayer.selectAll('.team-group').attr('transform', (team) => {
      return 'translate(0,' + team.envelope.y1 + ')'
    });
    
    // Groom the contributor sections
    let contributorSelection = self.contributorLayer.selectAll('.team-group').selectAll('.contributor-group')
        .data((d, i) => {
          return d.contributors
        }, (d) => {
          return d._id
        });
    
    let contributorGroupsEnter = contributorSelection.enter()
        .append('g')
        .attr('class', 'contributor-group')
        .attr('data-contributor-id', (d) => {
          return d._id
        })
        .on('mouseenter', (d) => {
          if (!self.inContributorDrag) {
            self.svg.selectAll('.contributor-highlight[data-contributor-id="' + d._id + '"]').classed('highlight', true)
          }
        })
        .on('mouseleave', (d) => {
          self.svg.selectAll('.contributor-highlight[data-contributor-id="' + d._id + '"]').classed('highlight', false)
        });
    
    contributorGroupsEnter.append('rect')
        .attr('class', 'contributor-background contributor-highlight')
        .attr('data-contributor-id', (d) => {
          return d._id
        })
        .attr('x', -self.namesWidth + self.config.teams.padding)
        .attr('y', 0)
        .attr('width', self.namesWidth + self.config.teams.padding - 2)
        .attr('height', self.config.contributors.height);
    
    contributorGroupsEnter.append('text')
        .attr('class', 'contributor-name')
        .attr('x', 0)
        .attr('y', self.config.contributors.height * 0.25)
        .text((d) => {
          return d.name
        });
    
    let dragContainerEnter = contributorGroupsEnter.append('g')
        .attr('class', 'contributor-drag-container')
        .attr('data-source-id', (d) => {
          return d._id
        });
    
    dragContainerEnter.append('g')
        .attr('class', 'contributor-drag-link-container');
    
    dragContainerEnter.append('circle')
        .attr('class', 'contributor-drag-handle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 7)
        .call(self.linkDragHandler);
    
    contributorSelection.exit().remove();
    
    self.contributorLayer.selectAll('.team-group')
        .selectAll('.contributor-group')
        .attr('transform', (contributor) => {
          return 'translate(' + (self.namesWidth - self.config.teams.padding) + ',' + (contributor.envelope.y1 + self.config.teams.padding) + ')'
        });
    
    self.contributorLayer.selectAll('.team-group')
        .selectAll('.contributor-group')
        .select('.contributor-drag-container')
        .attr('transform', 'translate(' + (self.config.teams.padding * 2) + ',' + (self.config.contributors.height / 2) + ')');
    
    // Clean up the offscreen layer
    self.offscreenLayer.selectAll('text').remove();
    
    // Position the body
    self.bodyLeft = self.namesWidth + self.config.teams.padding;
    self.chartBody.attr('transform', 'translate(' + self.bodyLeft + ',' + self.config.timeline.height + ')');
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.updateContributors completed:', Date.now() - startTime);
  }
  
  /**
   * Update all of the links for contributors
   */
  updateContributorLinks () {
    trace && console.log(Util.timestamp(), 'D3CapacityPlanChart.updateContributorLinks:', this.containerId);
    let self      = this,
        startTime = Date.now();
    
    let linkSelection = self.linkLayer.selectAll('.contributor-link')
        .data(self.data.links, (d) => {
          return d._id
        });
    
    linkSelection.exit().remove();
    
    linkSelection.enter().append('path')
        .attr('class', 'contributor-link contributor-highlight')
        .attr('data-contributor-id', (d) => {
          return d.contributorId
        })
        /*
      .style('stroke-width', (d) => {
        return self.config.contributors.height
      })
      */
        .on('mouseenter', (d) => {
          if (!self.inContributorDrag) {
            self.svg.selectAll('.contributor-highlight[data-contributor-id="' + d.contributorId + '"]').classed('highlight', true)
          }
        })
        .on('mouseleave', (d) => {
          self.svg.selectAll('.contributor-highlight[data-contributor-id="' + d.contributorId + '"]').classed('highlight', false)
        });
    
    let bodyBounds = self.chartBody.node().getBoundingClientRect();
    self.linkLayer.selectAll('.contributor-link')
        .attr('d', (d) => {
          let source       = self.svg.select('[data-source-id="' + d.sourceId + '"]'),
              target       = self.svg.select('[data-target-id="' + d.targetId + '"]'),
              sourceBounds = source.node().getBoundingClientRect(),
              targetBounds = target.node().getBoundingClientRect(),
              sourceSprint = (source.data() && source.data()[ 0 ] || {}).sprintNumber,
              targetSprint = (target.data() && target.data()[ 0 ] || {}).sprintNumber;
          
          sourceSprint = _.isNumber(sourceSprint) ? sourceSprint + 1 : 0;
          targetSprint = _.isNumber(targetSprint) ? targetSprint + 1 : 0;
          return self.linker({
            source   : [
              sourceSprint * self.sprintWidth,
              (sourceBounds.y - bodyBounds.y) + sourceBounds.height / 2
            ], target: [
              targetSprint * self.sprintWidth - self.sprintBodyWidth,
              (targetBounds.y - bodyBounds.y) + targetBounds.height / 2
            ]
          })
        });
    
    trace && console.log(Util.timestamp(), 'D3CapacityPlanChart.updateContributorLinks completed:', Date.now() - startTime);
  }
  
  /**
   * Parse the raw plan option into the required data sets
   * @param data
   */
  parseData (data) {
    trace && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData:', this.containerId);
    let self      = this,
        startTime = Date.now();
    
    // Store the option and plan records
    self.data = data;
    
    // Capture the teams
    let contributorIndex       = 0;
    self.data.contributorOrder = {};
    self.data.teams            = self.data.plan.teams().map((team) => {
      return {
        _id         : team._id,
        title       : team.title,
        contributors: team.contributors().fetch().filter((contributor) => {
          contributorIndex += 1;
          if (self.data.contributorOrder[ contributor._id ] === undefined) {
            self.data.contributorOrder[ contributor._id ] = contributorIndex;
          }
          return contributor.teamRoles({ teamId: team._id }).fetch().reduce((acc, role) => {
            return acc && role.roleDefinition().countForCapacity()
          }, true)
        })
      }
    }).filter((team) => {
      return team.contributors.length > 0
    });
    
    // Capture the sprints
    self.data.sprints.forEach((sprint) => {
      
      // Pull in the effort blocks and the data within them
      sprint.effortBlocks = self.data.option.sprintBlocks(sprint.sprintNumber, CapacityPlanBlockTypes.effort)
          .map((effortBlock) => {
            // Get all of the contributors for this effort
            effortBlock.contributorBlocks = self.data.option.sprintBlocks(sprint.sprintNumber, CapacityPlanBlockTypes.contributor, effortBlock._id)
                .fetch()
                .sort((a, b) => {
                  return self.data.contributorOrder[ a.dataId ] > self.data.contributorOrder[ b.dataId ] ? 1 : -1
                })
                .map((contributorBlock, i) => {
                  contributorBlock.itemBlocks = self.data.option.sprintBlocks(sprint.sprintNumber, CapacityPlanBlockTypes.item, contributorBlock._id)
                      .fetch();
                  
                  contributorBlock.parentIndex = i;
                  try {
                    contributorBlock.name = contributorBlock.dataRecord().name;
                  } catch (e) {
                    console.error('Block contributor data not found:', contributorBlock);
                  }
                  
                  return contributorBlock
                });
            
            // Grab the title
            try {
              effortBlock.title = effortBlock.dataRecord().title;
            } catch (e) {
              console.error('Block effort data not found:', effortBlock);
            }
            
            return effortBlock
          });
      
      // Figure out the sprint title
      sprint.title = _.isString(sprint.title) && sprint.title.length ? sprint.title : 'Sprint ' + (sprint.sprintNumber + 1);
    });
    
    // Groom the links
    self.data.links.forEach((link) => {
      let sourceBlock = link.source();
      if (sourceBlock) {
        link.contributorId = sourceBlock.dataId
      } else {
        link.contributorId = link.sourceId
      }
    });
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData completed:', Date.now() - startTime);
  }
  
  /**
   * Handle a link drag starting
   * @param d
   */
  linkDragStart (d) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.linkDragStart:', d);
    let self          = this,
        dragHandle    = d3.select(d3.event.sourceEvent.target),
        linkContainer = dragHandle.closest('.contributor-drag-container')
            .select('.contributor-drag-link-container'),
        dragLink      = linkContainer.append('path')
            .attr('class', 'contributor-drag-link');
    
    // Freeze out all contributor blocks and effort titles from pointer events
    self.sprintBodyLayer.selectAll('.effort-title').classed('no-mouse', true);
    self.sprintBodyLayer.selectAll('.contributor-block-group').classed('no-mouse', true);
    
    self.drag = {
      dragHandle: dragHandle,
      dragLink  : dragLink,
      startX    : parseFloat(dragHandle.attr('cx')),
      startY    : parseFloat(dragHandle.attr('cy'))
    };
    
    self.drag.dragHandle.classed('in-drag', true);
    self.inContributorDrag = true;
    
    trace && console.log('Drag Start:', self.drag)
  }
  
  /**
   * Handle a link drag moving
   * @param d
   */
  linkDragged (d) {
    //debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.linkDragged:', d);
    let self  = this,
        dragX = d3.event.x,
        dragY = d3.event.y;
    
    self.drag.dragHandle
        .attr('cx', dragX)
        .attr('cy', dragY);
    
    self.drag.dragLink.attr('d', self.linker({ source: [ 0, 0 ], target: [ dragX, dragY ] }))
  }
  
  /**
   * Handle a link drag ending
   * @param d
   */
  linkDragEnd (d) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.linkDragEnd:', d);
    let self = this;
    
    self.drag.dragHandle.classed('in-drag', false);
    self.inContributorDrag = false;
    
    self.drag.dragLink.remove();
    
    self.drag.dragHandle
        .transition()
        .duration(250)
        .attr('cx', self.drag.startX)
        .attr('cy', self.drag.startY);
    
    // Un-freeze contributor blocks and effort titles from pointer events
    self.sprintBodyLayer.selectAll('.effort-title').classed('no-mouse', false);
    self.sprintBodyLayer.selectAll('.contributor-block-group').classed('no-mouse', false);
    
    // Check for a drop
    if (self.drag.hover) {
      console.log('Potential drop:', self.drag.hover);
      self.drag.hover.element.classed('hover', false);
      
      let contributor = d.blockType === CapacityPlanBlockTypes.contributor ? d.dataRecord() : d;
      console.log('Dropping a link for contributor:', contributor);
      if (self.drag.hover.type === CapacityPlanBlockTypes.effort) {
        // Check for an existing block
        let blockCheck = self.data.option.sprintBlock(self.drag.hover.record.sprintNumber, contributor._id, self.drag.hover.record._id);
        if (!blockCheck) {
          // Create a block within the effort for this contributor
          let block = self.drag.hover.record.addChild(CapacityPlanBlockTypes.contributor, contributor._id, {});
          
          // Create a link
          block.addLink(d._id, d.sprintNumber);
          
          // Heal the links for this contributor
          self.data.option.healContributorLinks(contributor._id);
        } else {
          console.error('Block already exists:', blockCheck);
        }
      }
    }
    
    delete self.drag
  }
}