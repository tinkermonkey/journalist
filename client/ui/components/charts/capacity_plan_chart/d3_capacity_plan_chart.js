import { Util }                            from '../../../../../imports/api/util';
import { CapacityPlanBlockTypes }          from '../../../../../imports/api/capacity_plans/capacity_plan_block_types';
import { D3CapacityPlanBlockHandler }      from './d3_capacity_plan_block_handler';
import { D3CapacityPlanEffortListHandler } from './d3_capacity_plan_effort_list_handler';
import { D3CapacityPlanLinkHandler }       from './d3_capacity_plan_link_handler';
import { D3CapacityPlanLinkDragHandler }   from './d3_capacity_plan_link_drag_handler';
import { D3CapacityPlanSprintHandler }     from './d3_capacity_plan_sprint_handler';
import { D3CapacityPlanTeamHandler }       from './d3_capacity_plan_team_handler';
import './d3_closest';

let d3     = require('d3'),
    d3Drag = require('d3-drag'),
    debug  = true,
    trace  = false;

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
      header      : {
        height: 75
      },
      sprints     : {
        width  : 400,
        padding: 5
      },
      efforts     : {
        minHeight: 20,
        padding  : 5,
        margin   : 10
      },
      releases    : {
        width  : 35,
        height : 200,
        padding: 10
      },
      margin      : {
        top   : 15,
        right : 45,
        bottom: 25,
        left  : 5
      },
      shadow      : {
        height: 20
      }
    }, config);
    
    // Create the work handlers
    this.blockHandler      = new D3CapacityPlanBlockHandler(this);
    this.linkHandler       = new D3CapacityPlanLinkHandler(this);
    this.linkDragHandler   = new D3CapacityPlanLinkDragHandler(this);
    this.sprintHandler     = new D3CapacityPlanSprintHandler(this);
    this.teamHandler       = new D3CapacityPlanTeamHandler(this);
    this.effortListHandler = new D3CapacityPlanEffortListHandler(this);
    
    // Throttle the updates
    this.lastUpdateTime = 0;
  }
  
  /**
   * Generate the chart with some data
   * @param data
   */
  generate (data) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.generate:', this.containerId);
    let self           = this,
        containerWidth = $('#' + self.containerId).width(),
        startTime      = Date.now();
    
    // Generate the chart
    self.svg = d3.select('#' + self.containerId)
        .append('svg')
        .attr('class', 'capacity-plan-chart')
        .style('width', '100%')
        .style('height', parseInt(containerWidth * 0.3333) + 'px');
    
    // Create a section for defining clip paths
    self.svgDefs = self.svg.append('defs');
    
    // Draw an inner shadow along the top and bottom in absolute coordinates
    self.innerShadowTop = self.svg.append('rect')
        .attr('class', 'drop-shadow-top')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 10000)
        .attr('height', self.config.shadow.height);
    
    self.innerShadowBottom = self.svg.append('rect')
        .attr('class', 'drop-shadow-bottom')
        .attr('x', 0)
        .attr('y', parseInt(containerWidth * 0.3333) - self.config.shadow.height)
        .attr('width', 10000)
        .attr('height', self.config.shadow.height);
    
    // Create an offscreen layer for measuring text width
    self.offscreenLayer = self.svg.append('g')
        .attr('class', 'offscreen-layer')
        .attr('transform', 'translate(-10000, -10000)');
    
    // Create a base layer on which to build the chart
    self.baseLayer = self.svg.append('g')
        .attr('class', 'base-layer')
        .attr('transform', 'translate(' + self.config.margin.left + ',' + self.config.margin.top + ')');
    
    // Create a layer for the chart body
    self.chartBody = self.baseLayer.append('g')
        .attr('class', 'chart-body')
        .attr('transform', 'translate(0,' + self.config.header.height + ')');
    
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
        .attr('transform', 'translate(0,' + self.config.header.height + ')');
    
    // Create a y-axis separator
    self.yAxisSeparator = self.chartBody.append('line')
        .attr('class', 'y-axis-separator')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 1)
        .attr('y2', 1);
    
    // Create a layer for the timeline
    self.headerLayer = self.baseLayer.append('g')
        .attr('class', 'header-layer');
    
    // Create a layer for the effort list
    self.effortListLayer = self.baseLayer.append('g')
        .attr('class', 'effort-list-layer')
        .attr('transform', 'translate(' + self.config.efforts.margin + ',' + (self.config.efforts.margin + self.config.header.height) + ')');
    
    self.effortListBackground = self.effortListLayer.append('g')
        .attr('class', 'effort-list-background-group')
        .append('rect')
        .attr('class', 'effort-list-background effort-list-hide')
        .attr('rx', 8)
        .attr('ry', 8);
    
    // Append a control to show and hide the effort list
    self.effortListControl = self.effortListLayer.append('g')
        .attr('class', 'effort-list-control-group')
        .attr('transform', 'translate(' + self.config.efforts.margin + ', -20)')
        .append('circle')
        .attr('class', 'effort-list-control')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 10)
        .on('click', self.effortListHandler.toggleEffortList.bind(self.effortListHandler));
    
    // Create a clip path for effort list
    self.effortListClipPathId = 'effortList-' + self.containerId;
    self.effortListClipPath   = self.svgDefs.append('clipPath')
        .attr('id', self.effortListClipPathId);
    
    self.effortListClipPath.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', self.config.contributors.width)
        .attr('height', 0);
    
    // Create a foreground layer for the effort list
    self.effortListForeground = self.effortListLayer.append('g')
        .attr('class', 'effort-list-foreground')
        .attr('clip-path', 'url(#' + self.effortListClipPathId + ')');
    
    // Create a clip path for contributor names
    self.contributorClipPathId = 'contributorName-' + self.containerId;
    self.contributorClipPath   = self.svgDefs.append('clipPath')
        .attr('id', self.contributorClipPathId);
    
    self.contributorClipPath.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', self.config.contributors.width)
        .attr('height', self.config.contributors.height);
    
    // Create a drop-shadow filter
    self.hoverFilterId = 'hover-filter-' + self.containerId;
    self.hoverFilter   = self.svgDefs.append('filter')
        .attr('id', 'controls-drop-shadow')
        .attr('color-interpolation-filters', 'sRGB')
        .attr('x', '-100%')
        .attr('y', '-100%')
        .attr('width', '300%')
        .attr('height', '300%');
    self.hoverFilter.append('feGaussianBlur')
        .attr('stdDeviation', '5 5')
        .attr('result', 'outerGlowOut1');
    self.hoverFilter.append('feComposite')
        .attr('in', 'SourceGraphic')
        .attr('in2', 'outerGlowOut1')
        .attr('operator', 'over');
    
    self.topGradientId = 'hover-top-gradient-' + self.containerId;
    self.topGradient   = self.svgDefs.append('linearGradient')
        .attr('id', self.topGradientId)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', 1);
    self.topGradient.append('stop')
        .attr('class', 'shadow-gradient-stop-1')
        .attr('offset', '0%');
    self.topGradient.append('stop')
        .attr('class', 'shadow-gradient-stop-2')
        .attr('offset', '40%');
    self.topGradient.append('stop')
        .attr('class', 'shadow-gradient-stop-3')
        .attr('offset', '100%');
    
    self.bottomGradientId = 'hover-bottom-gradient-' + self.containerId;
    self.bottomGradientId = 'hover-bottom-gradient-' + self.containerId;
    self.bottomGradient   = self.svgDefs.append('linearGradient')
        .attr('id', self.bottomGradientId)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', 1);
    self.bottomGradient.append('stop')
        .attr('class', 'shadow-gradient-stop-3')
        .attr('offset', '0%');
    self.bottomGradient.append('stop')
        .attr('class', 'shadow-gradient-stop-2')
        .attr('offset', '60%');
    self.bottomGradient.append('stop')
        .attr('class', 'shadow-gradient-stop-1')
        .attr('offset', '100%');
    
    // Attach the gradients
    self.innerShadowTop.style('fill', 'url(#' + self.topGradientId + ')');
    self.innerShadowBottom.style('fill', 'url(#' + self.bottomGradientId + ')');
    
    // Create a link generator function
    self.linker = d3.linkHorizontal();
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.generate completed:', Date.now() - startTime);
  }
  
  /**
   * Update the chart with new data
   * @param data
   */
  update (data) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.update:', this.containerId);
    let self      = this,
        startTime = Date.now();
    
    // Throttle the updates
    if (Date.now() - self.lastUpdateTime < 500) {
      clearTimeout(self.updateTimeout);
      self.updateTimeout = setTimeout(() => {
        self.update(data);
      }, 500);
      return;
    }
    self.lastUpdateTime = Date.now();
    
    if (self.parseData(data)) {
      
      self.teamHandler.update();
      
      self.bodyLeft = self.namesWidth + self.config.teams.padding;
      self.chartBody.attr('transform', 'translate(' + self.bodyLeft + ',' + self.config.header.height + ')');
      
      self.sprintHandler.update();
      
      self.blockHandler.update();
      
      self.sprintHandler.updateSprintBackgrounds();
      
      // Center the contributors vertically
      if (self.contributorsHeight < self.maxSprintHeight) {
        self.contributorLayer.attr('transform', 'translate(0, ' + (self.config.header.height + (self.maxSprintHeight - self.contributorsHeight) / 2) + ')')
      } else {
        self.contributorLayer.attr('transform', 'translate(0, ' + self.config.header.height + ')')
      }
      
      // Update the yAxis separator
      self.yAxisSeparator
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 0)
          .attr('y2', Math.max(self.contributorsHeight, self.maxSprintHeight));
      
      // Update the links
      self.linkHandler.update();
      
      // Resize to fit the content
      self.height = Math.max(self.contributorsHeight, self.maxSprintHeight) + self.config.margin.top + self.config.margin.bottom + self.config.header.height;
      if (self.restoreHeight === undefined || self.restoreHeight < self.height) {
        self.svg.style('height', self.height + 'px');
        
        // Update the background drop shadows
        self.innerShadowBottom.attr('y', self.height - self.config.shadow.height);
      }
      
      // Update the effort list
      self.effortListHandler.update();
    }
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.update completed:', Date.now() - startTime);
  }
  
  /**
   * Parse the raw plan option into the required data sets
   * @param data
   */
  parseData (data) {
    trace && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData:', this.containerId);
    let self      = this,
        startTime = Date.now();
    
    if (!_.isObject(data)) {
      console.error(Util.timestamp(), 'D3CapacityPlanChart.parseData passed empty data object:', this.containerId);
      return false
    }
    
    // Store the option and plan records
    self.data = data;
    
    // Capture the teams
    let contributorIndex       = 0;
    self.data.contributorOrder = {};
    self.data.teams            = self.data.plan.teams().map((team) => {
      return {
        _id         : team._id,
        title       : team.title,
        contributors: team.contributorsInCapacityRole(self.data.roleId).fetch().map((contributor) => {
          contributorIndex += 1;
          if (self.data.contributorOrder[ contributor._id ] === undefined) {
            self.data.contributorOrder[ contributor._id ] = contributorIndex;
          }
          return contributor
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
                .filter((contributorBlock) => {
                  return self.data.contributorOrder[ contributorBlock.dataId ] !== undefined
                })
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
              effortBlock.title = effortBlock.dataRecord().itemTitle();
            } catch (e) {
              console.error('Block effort data not found:', effortBlock);
            }
            
            // Initialize a few flags
            effortBlock.isDisplaced  = false;
            effortBlock.displacement = 0;
            
            // Only show the release controls on the last sprint of an effort and if the effort is not already targeted for a release
            effortBlock.showReleaseControls = effortBlock.cousins().fetch().reduce((maxSprint, cousin) => {
              return Math.max(cousin.sprintNumber, maxSprint)
            }, 0) === effortBlock.sprintNumber && effortBlock.sourceLinks().count() === 0;
            
            return effortBlock
          });
      
      // Figure out the sprint title
      sprint.title = _.isString(sprint.title) && sprint.title.length ? sprint.title : 'Sprint ' + (sprint.sprintNumber + 1);
    });
    
    // Groom the releases
    self.data.releases.forEach((releaseBlock, i) => {
      try {
        let release        = releaseBlock.dataRecord();
        releaseBlock.title = release.title;
        releaseBlock.index = i;
        
        // Determine the correct sprint number
        //console.log('Determining correct sprint for release:', releaseBlock);
        let sprintNumber = self.data.sprints.length - 1;
        if (releaseBlock.targetLinks().count()) {
          sprintNumber = 0;
          //console.log('Found links for release:', releaseBlock, releaseBlock.targetLinks().fetch());
          releaseBlock.targetLinks().forEach((link) => {
            if (link.sourceSprint > sprintNumber) {
              //console.log('Found new maximum sprint number:', sprintNumber, link);
              sprintNumber = link.sourceSprint;
            }
          })
        }
        
        // Update the sprint number if it's not accurate
        if (sprintNumber !== releaseBlock.sprintNumber) {
          console.log('D3CapacityPlanChart.parseData adjusting sprint for release:', releaseBlock.dataId, sprintNumber, releaseBlock.sprintNumber);
          releaseBlock.updateSprintNumber(sprintNumber);
          releaseBlock.sprintNumber = sprintNumber;
        }
      } catch (e) {
        console.error('D3CapacityPlanChart.parseData failed to groom release data:', e, releaseBlock);
      }
    });
    
    trace && console.log('D3CapacityPlanChart.parseData releaseLinks:', self.data.releaseLinks);
    
    // Groom the contributor links
    self.data.contributorLinks.forEach((link) => {
      let sourceBlock = link.source();
      if (sourceBlock && sourceBlock.dataId) {
        link.contributorId = sourceBlock.dataId
      } else {
        link.contributorId = link.sourceId
      }
    });
    
    // Groom the release links
    self.data.releaseLinks.forEach((link) => {
      let sourceBlock = link.source(),
          targetBlock = link.target();
      
      link.effortId  = sourceBlock && sourceBlock.dataId;
      link.releaseId = targetBlock && targetBlock.dataId;
    });
    
    // Groom the effort list
    self.data.efforts.forEach((effort) => {
      // Replace the title with a linked item title if one exists
      effort.title = effort.itemTitle();
    });
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData completed:', Date.now() - startTime);
    return true
  }
}