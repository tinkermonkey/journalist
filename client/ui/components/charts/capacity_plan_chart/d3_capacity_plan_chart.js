import { Util } from '../../../../../imports/api/util';
import { CapacityPlanBlockTypes } from '../../../../../imports/api/capacity_plans/capacity_plan_block_types';
import { D3CapacityPlanBlockHandler } from './d3_capacity_plan_block_handler';
import { D3CapacityPlanLinkHandler } from './d3_capacity_plan_link_handler';
import { D3CapacityPlanLinkDragHandler } from './d3_capacity_plan_link_drag_handler';
import { D3CapacityPlanSprintHandler } from './d3_capacity_plan_sprint_handler';
import { D3CapacityPlanTeamHandler } from './d3_capacity_plan_team_handler';
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
    
    // Create the work handlers
    this.blockHandler    = new D3CapacityPlanBlockHandler(this);
    this.linkHandler     = new D3CapacityPlanLinkHandler(this);
    this.linkDragHandler = new D3CapacityPlanLinkDragHandler(this);
    this.sprintHandler   = new D3CapacityPlanSprintHandler(this);
    this.teamHandler     = new D3CapacityPlanTeamHandler(this);
  
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
    
    // Create an offscreen layer for measuring text width
    self.offscreenLayer = self.svg.append('g')
        .attr('class', 'offscreen-layer')
        .attr('transform', 'translate(-10000, -10000)');
    
    self.linker = d3.linkHorizontal();
    
    // Draw the data
    //self.update(data);
    
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
  
    if(Date.now() - self.lastUpdateTime < 500){
      clearTimeout(self.updateTimeout);
      self.updateTimeout = setTimeout(() => {
        self.update();
      }, 500);
      return;
    }
    
    self.parseData(data);
    
    self.teamHandler.update();
    
    self.bodyLeft = self.namesWidth + self.config.teams.padding;
    self.chartBody.attr('transform', 'translate(' + self.bodyLeft + ',' + self.config.header.height + ')');
    
    self.sprintHandler.update();
    
    self.blockHandler.update();
    
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
    for (let i = 1; i < 3; i++) {
      setTimeout(() => {
        //self.linkHandler.update();
      }, i * 60)
    }
    
    // Resize to fit the content
    self.svg.style('height', (Math.max(self.contributorsHeight, self.maxSprintHeight) + self.config.margin.top + self.config.margin.bottom + self.config.header.height) + 'px');
    
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
      if (sourceBlock.dataId) {
        link.contributorId = sourceBlock.dataId
      } else {
        link.contributorId = link.sourceId
      }
    });
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData completed:', Date.now() - startTime);
  }
}