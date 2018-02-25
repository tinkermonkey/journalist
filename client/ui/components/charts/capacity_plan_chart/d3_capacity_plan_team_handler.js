import { Util }                            from '../../../../../imports/api/util';
import { D3ContributorDragControlHandler } from './d3_contributor_drag_control_handler';

let d3            = require('d3'),
    controlTextX  = 0,
    controlTextY  = 0,
    controlRadius = 10,
    debug         = false;

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
    
    self.calculateEnvelopes();
    
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
    
    // Insert the base group
    let teamEnter = self.teamSelection.enter()
        .append('g')
        .attr('class', 'team-group')
        .attr('data-team-id', (d) => {
          return d._id
        });
    
    // Insert the title group
    let teamTitleEnter = teamEnter.append('g')
        .attr('class', 'team-title-group')
        .on('click', (team) => {
          chart.data.option.toggleTeamVisibility(team._id);
        })
        .on('mouseenter', (team) => {
          // Highlight all of the team contributors
          team.contributors.forEach((contributor) => {
            chart.svg.selectAll('.contributor-highlight[data-contributor-id="' + contributor._id + '"]').classed('highlight', true)
          });
        })
        .on('mouseleave', (team) => {
          // Remove highlight from all of the team contributors
          team.contributors.forEach((contributor) => {
            chart.svg.selectAll('.contributor-highlight[data-contributor-id="' + contributor._id + '"]').classed('highlight', false)
          });
        });
    
    teamTitleEnter.append('rect')
        .attr('class', 'team-title-background')
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', chart.config.teams.titleHeight)
        .attr('width', chart.namesWidth + chart.config.teams.padding);
    
    teamTitleEnter.append('text')
        .attr('class', 'team-title')
        .text((team) => {
          return team.title
        });
    
    // Insert the re-order controls
    // Add controls for this effort
    let teamControlsEnter = teamEnter.append('g')
        .attr('class', 'team-controls');
    
    let upButtonEnter = teamControlsEnter.append('g')
        .attr('class', 'effort-control effort-control-up')
        .attr('transform', 'translate(' + (1 * controlRadius + 2 * chart.config.efforts.padding) + ', 0)')
        .on('click', (team) => {
          chart.data.option.moveTeamUp(team._id)
        });
    
    upButtonEnter.append('circle')
        .attr('class', 'effort-control-background')
        .attr('r', controlRadius);
    
    upButtonEnter.append('text')
        .attr('x', controlTextX)
        .attr('y', controlTextY)
        .text('\u2191');
    
    let downButtonEnter = teamControlsEnter.append('g')
        .attr('class', 'effort-control effort-control-down')
        .attr('transform', 'translate(' + (3 * controlRadius + 3 * chart.config.efforts.padding) + ', 0)')
        .on('click', (team) => {
          chart.data.option.moveTeamDown(team._id)
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
   * Update existing teams
   */
  updateTeams () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanTeamHandler.updateTeams');
    let self  = this,
        chart = this.chart;
    
    self.updateTeamsSelection();
    
    // Place the team envelope
    self.teamSelection
        .transition()
        .duration(500)
        .attr('transform', (team, i) => {
          return 'translate(0,' + team.envelope.y1 + ')'
        });
    
    // Update the team title
    self.teamSelection.select('.team-title')
        .text((team) => {
          return team.title
        })
        .transition()
        .duration(500)
        .attr('transform', () => {
          return 'translate(' + (chart.namesWidth - chart.config.teams.padding) + ', ' + chart.config.teams.titlePadding + ')'
        });
    
    // Update the team title background
    self.teamSelection.select('.team-title-background')
        .classed('collapsed', (team) => {
          return team.visible === false
        })
        .attr('width', chart.namesWidth + chart.config.teams.padding - 2);
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
    
    self.contributorSelection.attr('opacity', (contributor) => {
          return contributor.visible ? 1 : 0
        })
        .attr('transform', (contributor) => {
          return 'translate(' + (chart.namesWidth - chart.config.teams.padding) + ',' + (contributor.envelope.y1) + ')'
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
  calculateEnvelopes () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanTeamHandler.calculateEnvelopes');
    let self  = this,
        chart = this.chart;
    
    // Set the y position for the groups
    let dy = 0,
        height,
        width;
    
    chart.namesWidth = 0;
    chart.data.teams.forEach((team) => {
      // Measure the width of the title
      chart.offscreenLayer.append('text')
          .attr('id', '_' + team._id)
          .attr('class', 'team-title')
          .text(team.title);
      
      if (team.visible) {
        height = chart.config.teams.titleHeight + team.contributors.length * chart.config.contributors.height + chart.config.teams.padding;
      } else {
        height = chart.config.teams.titleHeight + chart.config.teams.padding;
      }
      
      team.envelope = {
        x1    : 0,
        y1    : dy,
        x2    : chart.config.margin.left + chart.config.contributors.width,
        y2    : dy + height,
        height: height,
        width : chart.offscreenLayer.select('#_' + team._id).node().getBoundingClientRect().width
      };
      
      // Factor in the team title to the max width calc
      chart.namesWidth = Math.max(team.envelope.width, chart.namesWidth);
      
      team.contributors.forEach((contributor, i) => {
        // Measure the width of the title
        chart.offscreenLayer.append('text')
            .attr('class', 'contributor-name')
            .attr('id', '_' + contributor._id)
            .text(contributor.name);
        
        width = chart.offscreenLayer.select('#_' + contributor._id).node().getBoundingClientRect().width;
        
        contributor.envelope = {
          x1   : 0,
          y1   : i * chart.config.contributors.height + chart.config.teams.titleHeight,
          x2   : width,
          y2   : (i + 1) * chart.config.contributors.height + chart.config.teams.titleHeight,
          width: width
        };
        
        // Factor in the contributor name to the max width calc
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
