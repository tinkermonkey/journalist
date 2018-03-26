import { Util }                            from '../../../../../imports/api/util';
import { CapacityPlanBlockTypes }          from '../../../../../imports/api/capacity_plans/capacity_plan_block_types';
import { CapacityPlanSprintBlocks }        from '../../../../../imports/api/capacity_plans/capacity_plan_sprint_blocks';
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
      minScale     : 0.33,
      minUpdateTime: 1000,
      contributors : {
        height: 26,
        width : 120
      },
      teams        : {
        padding     : 8,
        titleHeight : 30,
        titlePadding: 6
      },
      header       : {
        height: 75
      },
      sprints      : {
        width  : 400,
        padding: 5
      },
      efforts      : {
        minHeight  : 20,
        padding    : 5,
        margin     : 10,
        titleHeight: 30
      },
      releases     : {
        width  : 35,
        height : 200,
        padding: 10
      },
      margin       : {
        top   : 15,
        right : 45,
        bottom: 25,
        left  : 5
      },
      shadow       : {
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
    
    // Keep track of the scale
    this.scale = 1;
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
    
    if (!Meteor.user().isManager()) {
      // This flag is used to disable draggers
      self.readOnly = true;
      self.svg.classed('read-only', true)
    }
    
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
    
    // Create a layer for background links
    self.backgroundLinkLayer = self.chartBody.append('g')
        .attr('class', 'background-link-layer');
    
    // Create a layer for the links
    self.linkLayer = self.chartBody.append('g')
        .attr('class', 'link-layer');
    
    // Create a layer for highlight links
    self.highlightLinkLayer = self.chartBody.append('g')
        .attr('class', 'highlight-link-layer');
    
    // Create a layer for the timeline
    self.sprintBodyLayer = self.chartBody.append('g')
        .attr('class', 'sprint-body-layer');
    
    // Create a layer for the time blocks
    self.chartHighlightLayer = self.chartBody.append('g')
        .attr('class', 'chart-highlight-layer');
    
    // Create a layer for the contributors list
    self.contributorLayer = self.baseLayer.append('g')
        .attr('class', 'contributor-layer')
        .attr('transform', 'translate(0,' + self.config.header.height + ')');
    
    // Create a layer for the teams list
    self.teamLayer = self.baseLayer.append('g')
        .attr('class', 'teams-layer')
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
        .attr('transform', 'translate(0,' + (self.config.header.height) + ')');
    
    self.effortListBackground = self.effortListLayer.append('g')
        .attr('class', 'effort-list-background-group')
        .append('rect')
        .attr('class', 'effort-list-background effort-list-hide')
        .attr('rx', 8)
        .attr('ry', 8);
    
    // Append a control to show and hide the effort list
    self.effortListControl = self.effortListLayer.append('g')
        .attr('class', 'effort-list-control-group')
        .attr('transform', 'translate(' + self.config.efforts.margin + ', -30)')
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
    
    // Create a group in the effort list foreground for the unused efforts
    self.unplannedEffortList = self.effortListForeground.append('g')
        .attr('class', 'unplanned-effort-list');
    
    self.unplannedEffortList.append('text')
        .attr('class', 'effort-list-title')
        .attr('x', self.config.efforts.margin)
        .attr('y', self.config.efforts.margin)
        .text('Un-planned efforts');
    
    // Create a group in the effort list foreground for the used efforts
    self.plannedEffortList = self.effortListForeground.append('g')
        .attr('class', 'planned-effort-list');
    
    self.plannedEffortList.append('text')
        .attr('class', 'effort-list-title')
        .attr('x', self.config.efforts.margin)
        .attr('y', self.config.efforts.margin)
        .text('Planned efforts');
    
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
    
    // Create a gradient for the top inner-shadow
    self.topGradientId = 'inner-top-gradient-' + self.containerId;
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
    
    // Create a gradient for the bottom inner-shadow
    self.bottomGradientId = 'inner-bottom-gradient-' + self.containerId;
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
    
    // Create a gradient for the release links
    self.releaseLinkGradientId = 'release-link-gradient-' + self.containerId;
    self.releaseLinkGradient   = self.svgDefs.append('linearGradient')
        .attr('id', self.releaseLinkGradientId)
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 1)
        .attr('y2', 0);
    self.releaseLinkGradient.append('stop')
        .attr('class', 'release-link-gradient-stop-1')
        .attr('offset', '0%');
    self.releaseLinkGradient.append('stop')
        .attr('class', 'release-link-gradient-stop-2')
        .attr('offset', '100%');
    
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
    if (Date.now() - self.lastUpdateTime < self.config.minUpdateTime) {
      clearTimeout(self.updateTimeout);
      self.updateTimeout = setTimeout(() => {
        self.update(data);
      }, self.config.minUpdateTime);
      return;
    }
    self.lastUpdateTime = Date.now();
    
    if (self.parseData(data)) {
      self.teamHandler.update();
      
      self.bodyLeft = self.namesWidth + self.config.teams.padding;
      self.chartBody.attr('transform', 'translate(' + self.bodyLeft + ',' + self.config.header.height + ')');
      
      self.sprintHandler.update();
      
      // Scale down if needed and loop through again short circuiting the throttling
      trace && console.log(Util.timestamp(), 'D3CapacityPlanChart.update:', self.proposedScale, self.scale);
      if (Math.abs(self.proposedScale - self.scale) > 0.05) {
        self.scale          = self.proposedScale;
        self.lastUpdateTime = 0;
        self.update(data);
        
        // Sometimes when scaled down the
        setTimeout(() => {
          self.update(data);
        }, 500);
        return;
      } else {
        self.baseLayer.attr('transform', 'translate(' + self.config.margin.left + ',' + self.config.margin.top + '), scale(' + self.scale + ')');
      }
      
      self.blockHandler.update();
      
      self.sprintHandler.updateSprintBackgrounds();
      
      // Update the yAxis separator
      self.yAxisSeparator
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', 0)
          .attr('y2', self.maxContentHeight());
      
      // Update the links
      self.linkHandler.update();
      
      // Resize to fit the content
      self.height = self.scale * (self.maxContentHeight() + self.config.header.height) + self.config.margin.top + self.config.margin.bottom;
      self.svg.style('height', self.height + 'px');
      
      // Update the background drop shadows
      self.innerShadowBottom.attr('y', self.height - self.config.shadow.height);
      
      // Update the effort list
      self.effortListHandler.update();
    }
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.update completed:', Date.now() - startTime);
  }
  
  /**
   * Get the height that should be used as the 'height'
   */
  maxContentHeight () {
    let self = this;
    return Math.max(self.tempContentHeight || 0, self.contributorsHeight || 0, self.maxSprintHeight || 0)
  }
  
  /**
   * Parse the raw plan option into the required data sets
   * @param data
   */
  parseData (data) {
    trace && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData:', this.containerId);
    let self      = this,
        startTime = Date.now(),
        splitTime;
    
    if (!_.isObject(data)) {
      console.error(Util.timestamp(), 'D3CapacityPlanChart.parseData passed empty data object:', this.containerId);
      return false
    }
    
    // Store the option and plan records
    self.data = data;
    
    // Capture the teams
    splitTime                       = Date.now();
    let contributorIndex            = 0;
    self.data.contributorOrder      = {};
    self.data.contributorVisibility = {};
    self.data.teams                 = self.data.plan.teams()
        .fetch()
        .filter((team) => {
          if (self.data.teamId) {
            return team._id === self.data.teamId
          } else {
            return true
          }
        })
        .map((team, i) => {
          let teamSettings = self.data.option.getTeamSettings(team._id),
              visible      = teamSettings.visible;
          
          return {
            _id         : team._id,
            title       : team.title,
            visible     : visible,
            order       : teamSettings.order !== undefined ? teamSettings.order : i,
            contributors: team.contributorsInCapacityRoles(self.data.roleIds).fetch().map((contributor) => {
              contributorIndex += 1;
              if (self.data.contributorOrder[ contributor._id ] === undefined) {
                self.data.contributorOrder[ contributor._id ] = contributorIndex;
              }
              
              // Inherit the visibility of the team
              contributor.visible = visible;
              
              // Keep track of whether this contributor should be shown, using an or in case the contributor is on multiple teams and one is shown
              self.data.contributorVisibility[ contributor._id ] = self.data.contributorVisibility[ contributor._id ] || visible;
              
              return contributor
            }),
          }
        }).filter((team) => {
          return team.contributors.length > 0
        })
        .sort((a, b) => {
          return a.order > b.order ? 1 : -1
        });
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData teams parse:', Date.now() - splitTime);
    
    self.data.contributorIdList = _.keys(self.data.contributorOrder);
    
    // Capture the sprints
    splitTime = Date.now();
    self.data.sprints.forEach((sprint) => {
      // Pull in the effort blocks and the data within them
      sprint.effortBlocks = self.data.option.sprintBlocks(sprint.sprintNumber, CapacityPlanBlockTypes.effort)
          .fetch()
          .filter((effortBlock) => {
            if (self.data.teamId) {
              return CapacityPlanSprintBlocks.find({
                optionId : self.data.option._id,
                blockType: CapacityPlanBlockTypes.contributor,
                dataId   : { $in: self.data.contributorIdList },
                parentId : effortBlock._id
              }).count() > 0
            } else {
              return true
            }
          })
          .map((effortBlock) => {
            // Get all of the contributors for this effort
            effortBlock.contributorBlocks = self.data.option.sprintBlocks(sprint.sprintNumber, CapacityPlanBlockTypes.contributor, effortBlock._id)
                .fetch()
                .filter((contributorBlock) => {
                  return self.data.contributorOrder[ contributorBlock.dataId ] !== undefined
                })
                .filter((contributorBlock) => {
                  return self.data.contributorVisibility[ contributorBlock.dataId ]
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
            effortBlock.showReleaseLinker = effortBlock.cousins().fetch().reduce((maxSprint, cousin) => {
              return Math.max(cousin.sprintNumber, maxSprint)
            }, 0) === effortBlock.sprintNumber && effortBlock.sourceLinks().count() === 0;
            
            // Only show the release unlink controls on the last sprint if there is a link
            effortBlock.showReleaseUnlinker = effortBlock.cousins().fetch().reduce((maxSprint, cousin) => {
              //console.log('showReleaseUnlinker:', effortBlock.title, effortBlock.sprintNumber, cousin.sprintNumber, maxSprint, effortBlock.sourceLinks().count());
              return Math.max(cousin.sprintNumber, maxSprint)
            }, 0) === effortBlock.sprintNumber && effortBlock.sourceLinks().count() > 0;
            //console.log('showReleaseUnlinker result:', effortBlock.title, effortBlock.sprintNumber, effortBlock.showReleaseUnlinker);
            
            return effortBlock
          });
      
      // Figure out the sprint title
      sprint.title = _.isString(sprint.title) && sprint.title.length ? sprint.title : 'Sprint ' + (sprint.sprintNumber + 1);
    });
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData sprints parse:', Date.now() - splitTime);
    
    // Groom the releases
    splitTime = Date.now();
    self.data.releases.forEach((releaseBlock, i) => {
      try {
        let release        = releaseBlock.dataRecord();
        releaseBlock.title = release.title();
        releaseBlock.index = i;
        
        // Determine the correct sprint number
        //console.log('Determining correct sprint for release:', releaseBlock);
        let sprintNumber = self.data.sprints.length - 1;
        if (releaseBlock.targetLinks().count()) {
          sprintNumber = 0;
          //console.log('Found links for release:', releaseBlock._id, releaseBlock.targetLinks().fetch());
          releaseBlock.targetLinks().forEach((link) => {
            //console.log('Release Content:', releaseBlock._id, link.sourceSprint);
            if (link.sourceSprint > sprintNumber) {
              sprintNumber = link.sourceSprint;
              //console.log('Found new maximum sprint number for release:', releaseBlock._id, sprintNumber, link.sourceSprint);
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
    
    // If this is for a single team, show only the released they care about
    if (self.data.teamId) {
      let blockIds = _.flatten(self.data.sprints.map((sprint) => {
        return sprint.effortBlocks.map((block) => {
          return block._id
        })
      }));
      
      self.data.releases = self.data.releases.filter((releaseBlock) => {
        return releaseBlock.targetLinks().fetch().filter((link) => {
          return _.contains(blockIds, link.sourceId)
        }).length > 0
      });
    }
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData releases parse:', Date.now() - splitTime);
    
    // Groom the contributor links
    splitTime = Date.now();
    self.data.contributorLinks.forEach((link) => {
      let sourceBlock = link.source();
      if (sourceBlock && sourceBlock.dataId) {
        link.contributorId = sourceBlock.dataId
      } else {
        link.contributorId = link.sourceId
      }
    });
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData contributorLinks parse:', Date.now() - splitTime);
    
    // Groom the release links
    splitTime = Date.now();
    self.data.releaseLinks.forEach((link) => {
      let sourceBlock = link.source(),
          targetBlock = link.target();
      
      link.effortId  = sourceBlock && sourceBlock.dataId;
      link.releaseId = targetBlock && targetBlock.dataId;
    });
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData releaseLinks parse:', Date.now() - splitTime);
    
    // Groom the effort list
    splitTime = Date.now();
    self.data.efforts.forEach((effort) => {
      // Replace the title with a linked item title if one exists
      effort.title = effort.itemTitle();
    });
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData effort title parse:', Date.now() - splitTime);
    
    // Sort the efforts into those in a plan and those not used yet
    splitTime               = Date.now();
    self.data.usedEfforts   = [];
    self.data.unUsedEfforts = [];
    self.data.efforts.forEach((effort) => {
      effort.usageCount = CapacityPlanSprintBlocks.find({
        optionId : self.data.option._id,
        blockType: CapacityPlanBlockTypes.effort,
        dataId   : effort._id
      }).count();
    });
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData effort usage count:', Date.now() - splitTime);
    
    // Create synthetic links for all of the efforts
    splitTime             = Date.now();
    self.data.effortLinks = [];
    self.data.efforts.forEach((effort) => {
      // Get all of the blocks
      let previousBlock;
      CapacityPlanSprintBlocks.find({
        optionId: self.data.option._id,
        dataId  : effort._id
      }, { sort: { sprintNumber: 1 } }).forEach((block) => {
        if (previousBlock) {
          self.data.effortLinks.push({
            _id     : previousBlock._id + '_' + block._id,
            sourceId: previousBlock._id,
            targetId: block._id,
            effortId: effort._id
          });
        }
        previousBlock = _.clone(block);
      });
    });
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData sythetic effort links:', Date.now() - splitTime);
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData completed:', Date.now() - startTime);
    return true
  }
  
  /**
   * Scale a client rect from getBoundingClientRecot
   */
  scaleClientRect (rect) {
    let self = this;
    
    return {
      x     : rect.x / self.scale,
      y     : rect.y / self.scale,
      width : rect.width / self.scale,
      height: rect.height / self.scale
    }
  }
  
  debug () {
    return debug
  }
}