import { Session } from 'meteor/session';
import { Util } from '../../../../imports/api/util';

let d3    = require('d3'),
    debug = true,
    trace = false;

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
    
    self.baseLayer = self.svg.append('g')
        .attr('class', 'base-layer')
        .attr('transform', 'translate(' + self.config.margin.left + ',' + self.config.margin.top + ')');
    
    self.chartBody = self.baseLayer.append('g')
        .attr('class', 'chart-body');
    
    // Create a layer for the timeline
    self.timelineLayer = self.chartBody.append('g')
        .attr('class', 'timeline-layer');
    
    // Create a layer for the links
    self.linkLayer = self.chartBody.append('g')
        .attr('class', 'link-layer');
    
    // Create a layer for the time blocks
    self.blockLayer = self.chartBody.append('g')
        .attr('class', 'block-layer');
    
    // Create a layer for the
    self.contributorLayer = self.baseLayer.append('g')
        .attr('class', 'contributor-layer')
        .attr('transform', 'translate(0,' + self.config.timeline.height + ')');
    
    // Create a y-axis separator
    self.yAxisSeparator = self.contributorLayer.append('line')
        .attr('class', 'y-axis-separator')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 1)
        .attr('y2', 1);
    
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
    let self = this;
    
    self.parseData(data);
    
    self.updateContributors();
    
    self.updateTimeline();
    
    // Resize to fit the content
    self.svg.style('height', (self.bodyHeight + self.config.margin.top + self.config.margin.bottom + self.config.timeline.height) + 'px');
  }
  
  /**
   * Update the chart's x axis timeline
   */
  updateTimeline () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.updateTimeline:', this.containerId);
    let self        = this,
        startTime   = Date.now(),
        bodyWidth   = self.svg.node().getBoundingClientRect().width - self.config.margin.left - self.config.margin.right - self.bodyLeft,
        sprintWidth = Math.min(bodyWidth / self.sprintData.length, self.config.sprints.width);
    
    // Update the sprint titles
    let sprintTitleSelection = self.timelineLayer.selectAll('.sprint-header-group')
        .data(self.sprintData, (d) => {
          return d.id
        });
    
    sprintTitleSelection.exit().remove();
    
    let sprintTitleEnter = sprintTitleSelection.enter()
        .append('g')
        .attr('class', 'sprint-header-group');
    
    sprintTitleEnter.append('text')
        .attr('class', 'sprint-header-title')
        .attr('y', 25)
        .text((sprint) => {
          return 'Sprint ' + (sprint.id + 1)
        });
    
    sprintTitleEnter.append('text')
        .attr('class', 'sprint-header-title')
        .attr('y', 45)
        .text((sprint) => {
          return moment(sprint.start).format('ddd, MMM Do')
        });
    
    // Place the title groups
    self.timelineLayer.selectAll('.sprint-header-group')
        .attr('transform', (sprint) => {
          return 'translate(' + (sprint.id * sprintWidth + sprintWidth / 2) + ',0)'
        });
    
    // Update the sprint body content
    let sprintSelection = self.timelineLayer.selectAll('.sprint-group')
        .data(self.sprintData, (d) => {
          return d.id
        });
    
    sprintSelection.exit().remove();
    
    let sprintGroupEnter = sprintSelection.enter()
        .append('g')
        .attr('class', 'sprint-group')
        .attr('data-sprint-id', (d) => {
          return d.id
        });
    
    sprintGroupEnter.append('rect')
        .attr('class', 'sprint-section sprint-link-section')
        .attr('x', 0)
        .attr('y', 0);
    
    sprintGroupEnter.append('rect')
        .attr('class', 'sprint-section sprint-body-section')
        .attr('x', sprintWidth / 2)
        .attr('y', 0)
        .attr('width', sprintWidth / 2)
        .attr('height', self.bodyHeight)
        .on('mouseenter', (d) => {
          let element = self.timelineLayer.select('.sprint-group[data-sprint-id="' + d.id + '"] .sprint-body-section');
          element.classed('hover', true);
          
          if (self.inContributorDrag) {
            self.drag.hover = {
              type: 'sprint',
              data: d
            };
          } else if (Session.get('in-effort-drag')) {
            console.log('Mouseover in effort drag:', d);
            Session.set('sprint-hover-id', d.id);
          }
        })
        .on('mouseleave', (d) => {
          let element = self.timelineLayer.select('.sprint-group[data-sprint-id="' + d.id + '"] .sprint-body-section');
          element.classed('hover', false);
          if (self.inContributorDrag) {
            delete self.drag.hover;
          } else if (Session.get('in-effort-drag')) {
            console.log('Mouseover in effort drag:', d);
            Session.set('sprint-hover-id', null);
          }
        });
    
    // Place the groups
    self.timelineLayer.selectAll('.sprint-group')
        .attr('transform', (sprint) => {
          return 'translate(' + (sprint.id * sprintWidth) + ',' + self.config.timeline.height + ')'
        });
    
    // Size the timelines
    self.timelineLayer.selectAll('.sprint-group')
        .selectAll('.sprint-section')
        .attr('width', sprintWidth / 2)
        .attr('height', self.bodyHeight);
    
    self.timelineLayer.selectAll('.sprint-group')
        .selectAll('.sprint-body-section')
        .attr('x', sprintWidth / 2);
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.updateTimeline completed:', Date.now() - startTime);
  }
  
  /**
   * Update the team roster sections
   */
  updateContributors () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.updateContributors:', this.containerId);
    let self      = this,
        startTime = Date.now();
    
    // Set the y position for the groups
    let dy         = 0,
        namesWidth = 0,
        height,
        width;
    self.teamData.forEach((team) => {
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
        
        namesWidth = Math.max(width, namesWidth);
      });
      
      dy = team.envelope.y2;
    });
    self.bodyHeight = Math.max(dy, 20);
    
    // Add some padding to the names
    namesWidth += self.config.teams.padding * 2;
    
    // Groom the team groups
    let teamSelection = self.contributorLayer.selectAll('.team-group')
        .data(self.teamData, (team) => {
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
        });
    
    contributorGroupsEnter.append('rect')
        .attr('class', 'contributor-background')
        .attr('x', -namesWidth + self.config.teams.padding)
        .attr('y', 0)
        .attr('width', namesWidth)
        .attr('height', self.config.contributors.height);
    
    contributorGroupsEnter.append('text')
        .attr('class', 'contributor-name')
        .attr('x', 0)
        .attr('y', self.config.contributors.height * 0.25)
        .text((d) => {
          return d.name
        });
    
    contributorGroupsEnter.append('circle')
        .attr('class', 'contributor-drag-handle')
        .attr('r', 7)
        .call(self.linkDragHandler);
    
    contributorSelection.exit().remove();
    
    self.contributorLayer.selectAll('.team-group').selectAll('.contributor-group').attr('transform', (contributor) => {
      return 'translate(' + (namesWidth - self.config.teams.padding) + ',' + (contributor.envelope.y1 + self.config.teams.padding) + ')'
    });
    
    self.contributorLayer.selectAll('.team-group').selectAll('.contributor-group').select('.contributor-drag-handle')
        .attr('cx', self.config.teams.padding * 2)
        .attr('cy', self.config.contributors.height / 2);
    
    self.yAxisSeparator
        .attr('x1', namesWidth + self.config.teams.padding)
        .attr('y1', 0)
        .attr('x2', namesWidth + self.config.teams.padding)
        .attr('y2', self.bodyHeight);
    
    // Clean up the offscreen layer
    self.offscreenLayer.selectAll('text').remove();
    
    // Position the body
    self.bodyLeft = namesWidth + self.config.teams.padding;
    self.chartBody.attr('transform', 'translate(' + self.bodyLeft + ',0)');
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.updateContributors completed:', Date.now() - startTime);
  }
  
  /**
   * Parse the raw plan option into the required data sets
   * @param data
   */
  parseData (data) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData:', this.containerId);
    let self      = this,
        startTime = Date.now(),
        plan      = data.plan();
    
    trace && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData data:', data);
    trace && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData plan:', data.plan && data.plan());
    trace && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData teams:', data.plan && data.plan().teams());
    
    // Parse the teams
    self.teamData = data.plan().teams().map((team) => {
      return {
        _id         : team._id,
        title       : team.title,
        contributors: team.contributors().fetch().filter((contributor) => {
          return contributor.teamRoles({ teamId: team._id }).fetch().reduce((acc, role) => {
            return acc && role.roleDefinition().countForCapacity()
          }, true)
        })
      }
    }).filter((team) => {
      return team.contributors.length > 0
    });
    
    // Parse the timeline
    self.sprintData = data.sprints().fetch();
    
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.parseData completed:', Date.now() - startTime);
  }
  
  /**
   * Handle a link drag starting
   * @param d
   */
  linkDragStart (d) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.linkDragStart:', d);
    let self        = this,
        dragElement = d3.select('g[data-contributor-id="' + d._id + '"] circle.contributor-drag-handle');
    
    self.drag = {
      element: dragElement,
      startX : parseFloat(dragElement.attr('cx')),
      startY : parseFloat(dragElement.attr('cy'))
    };
    
    self.drag.element.classed('in-drag', true);
    self.inContributorDrag = true;
    
    console.log('Drag Start:', self.drag)
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
    
    self.drag.element.attr('cx', dragX)
        .attr('cy', dragY);
  }
  
  /**
   * Handle a link drag ending
   * @param d
   */
  linkDragEnd (d) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanChart.linkDragEnd:', d);
    let self = this;
    
    self.drag.element.classed('in-drag', false);
    self.inContributorDrag = false;
    
    self.drag.element
        .transition()
        .duration(250)
        .attr('cx', self.drag.startX)
        .attr('cy', self.drag.startY);
    
    // Check for a drop
    if (self.drag.hover) {
      console.log('Potential drop:', self.drag.hover);
    }
    
    delete self.drag
  }
}