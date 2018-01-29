import { Util } from '../../../../../imports/api/util';
import { D3ContributorDragControlHandler } from './d3_contributor_drag_control_handler';

let d3    = require('d3'),
    debug = false;

export class D3CapacityPlanTeamHandler {
  /**
   * D3CapacityPlanSprintHandler takes care of constructing and updating the capacity plan team representations
   * @param chart
   */
  constructor (chart) {
    this.chart          = chart;
    this.controlHandler = new D3ContributorDragControlHandler(chart, this);
  }
  
  update () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanTeamHandler.update');
    let self  = this,
        chart = this.chart;
    
    self.calculateTeamHeights();
    
    // Service the teams sections
    self.insertTeams();
    self.updateTeams();
    self.removeTeams();
    
    // Service the contributors
    self.insertContributors();
    self.updateContributors();
    self.removeContributors();
  }
  
  /**
   * Update the selection of currently existing teams
   */
  updateTeamsSelection () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanTeamHandler.updateTeamsSelection');
    let self  = this,
        chart = this.chart;
    
    self.teamSelection = chart.contributorLayer.selectAll('.team-group')
        .data(chart.data.teams, (team) => {
          return team._id
        });
  }
  
  /**
   * Insert new teams
   */
  insertTeams () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanTeamHandler.insertTeams');
    let self  = this,
        chart = this.chart;
    
    self.updateTeamsSelection();
    
    self.teamSelection.enter()
        .append('g')
        .attr('class', 'team-group')
        .attr('data-team-id', (d) => {
          return d._id
        });
  }
  
  /**
   * Update existing teams
   */
  updateTeams () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanTeamHandler.updateTeams');
    let self  = this,
        chart = this.chart;
    
    self.updateTeamsSelection();
    
    self.teamSelection.attr('transform', (team, i) => {
      return 'translate(0,' + team.envelope.y1 + ')'
    });
  }
  
  /**
   * Remove unneeded teams
   */
  removeTeams () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanTeamHandler.removeTeams');
    let self  = this,
        chart = this.chart;
    
    self.teamSelection.exit().remove();
  }
  
  /**
   * Update the selection of currently existing contributors
   */
  updateContributorSelection () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanTeamHandler.updateContributorSelection');
    let self  = this,
        chart = this.chart;
    
    self.contributorSelection = chart.contributorLayer
        .selectAll('.team-group')
        .selectAll('.contributor-group')
        .data((d, i) => {
          return d.contributors
        }, (d) => {
          return d._id
        })
  }
  
  /**
   * Insert new contributors
   */
  insertContributors () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanTeamHandler.insertContributors');
    let self  = this,
        chart = this.chart;
    
    self.updateContributorSelection();
    
    let contributorGroupsEnter = self.contributorSelection.enter()
        .append('g')
        .attr('class', 'contributor-group')
        .attr('data-contributor-id', (d) => {
          return d._id
        })
        .on('mouseenter', (d) => {
          if (!chart.inContributorDrag) {
            chart.svg.selectAll('.contributor-highlight[data-contributor-id="' + d._id + '"]').classed('highlight', true)
          }
        })
        .on('mouseleave', (d) => {
          chart.svg.selectAll('.contributor-highlight[data-contributor-id="' + d._id + '"]').classed('highlight', false)
        });
    
    contributorGroupsEnter.append('rect')
        .attr('class', 'contributor-background')
        .attr('x', -chart.namesWidth + chart.config.teams.padding)
        .attr('y', 0)
        .attr('width', chart.namesWidth + chart.config.teams.padding - 2)
        .attr('height', chart.config.contributors.height);
    
    contributorGroupsEnter.append('path')
        .attr('class', 'contributor-background-path contributor-highlight')
        .attr('data-contributor-id', (d) => {
          return d._id
        })
        .attr('d', 'm' + (-chart.namesWidth + chart.config.teams.padding) + ' ' + (chart.config.contributors.height / 2) + ' l' + (chart.namesWidth + chart.config.teams.padding - 2) + ' 0');
    
    contributorGroupsEnter.append('text')
        .attr('class', 'contributor-name')
        .attr('x', 0)
        .attr('y', chart.config.contributors.height * 0.25)
        .text((d) => {
          return d.name
        });
    
    // Create the controls
    self.controlHandler.insert(contributorGroupsEnter);
  }
  
  /**
   * Update all contributors
   */
  updateContributors () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanTeamHandler.updateContributors');
    let self  = this,
        chart = this.chart;
    
    self.updateContributorSelection();
    
    self.contributorSelection.attr('transform', (contributor) => {
      return 'translate(' + (chart.namesWidth - chart.config.teams.padding) + ',' + (contributor.envelope.y1 + chart.config.teams.padding) + ')'
    });
    
    self.contributorSelection.select('.contributor-background')
        .attr('x', -chart.namesWidth + chart.config.teams.padding)
        .attr('width', chart.namesWidth + chart.config.teams.padding - 2);

    self.contributorSelection.select('.contributor-background-path')
        .attr('d', 'm' + (-chart.namesWidth + chart.config.teams.padding) + ' ' + (chart.config.contributors.height / 2) + ' l' + (chart.namesWidth + chart.config.teams.padding - 2) + ' 0');
    
    self.contributorSelection.select('.link-drag-group')
        .attr('transform', 'translate(' + (chart.config.teams.padding * 2) + ',' + (chart.config.contributors.height / 2) + ')');
  }
  
  /**
   * Remove unneeded contributors
   */
  removeContributors () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanTeamHandler.removeContributors');
    let self  = this,
        chart = this.chart;
    
    self.contributorSelection.exit().remove();
  }
  
  /**
   * Size all of the team blocks
   */
  calculateTeamHeights () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanTeamHandler.calculateTeamHeights');
    let self  = this,
        chart = this.chart;
    
    // Set the y position for the groups
    let dy           = 0,
        height,
        width;
    chart.namesWidth = 0;
    chart.data.teams.forEach((team) => {
      // Measure the width of the title
      chart.offscreenLayer.append('text')
          .attr('id', '_' + team._id)
          .text(team.title);
      
      height = team.contributors.length * chart.config.contributors.height + 2 * chart.config.teams.padding;
      
      team.envelope = {
        x1    : 0,
        y1    : dy,
        x2    : chart.config.margin.left + chart.config.contributors.width,
        y2    : dy + height,
        height: height,
        width : chart.offscreenLayer.select('#_' + team._id).node().getBoundingClientRect().width
      };
      
      team.contributors.forEach((contributor, i) => {
        // Measure the width of the title
        chart.offscreenLayer.append('text')
            .attr('class', 'contributor-name')
            .attr('id', '_' + contributor._id)
            .text(contributor.name);
        
        width = chart.offscreenLayer.select('#_' + contributor._id).node().getBoundingClientRect().width;
        
        contributor.envelope = {
          x1   : 0,
          y1   : i * chart.config.contributors.height,
          x2   : width,
          y2   : (i + 1) * chart.config.contributors.height,
          width: width
        };
        
        chart.namesWidth = Math.max(width, chart.namesWidth);
      });
      
      dy = team.envelope.y2;
    });
    chart.contributorsHeight = Math.max(dy, 20);
    
    // Add some padding to the names and force it to a whole number of pixels
    chart.namesWidth = Math.max(chart.namesWidth, chart.config.contributors.width);
    chart.namesWidth += chart.config.teams.padding * 2;
    chart.namesWidth = parseInt(chart.namesWidth);
    
    // Clean up the offscreen layer
    chart.offscreenLayer.selectAll('text').remove();
  }
}
