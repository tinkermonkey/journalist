import { Util } from '../../../../../imports/api/util';

let debug = false;

export class D3CapacityPlanLinkHandler {
  constructor (chart) {
    this.chart = chart
  }
  
  /**
   * Update all of the links
   */
  update () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.update');
    let self  = this,
        chart = this.chart;
    
    chart.bodyBounds = chart.chartBody.node().getBoundingClientRect();
    
    // Service the contributor links
    self.insertContributorLinks();
    self.updateContributorLinks();
    self.removeContributorLinks();
    
    // Service the release links
    self.insertReleaseLinks();
    self.updateReleaseLinks();
    self.removeReleaseLinks();
  }
  
  /**
   * Select all of the existing links
   */
  updateContributorLinkSelection () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateContributorLinkSelection');
    let self  = this,
        chart = this.chart;
    
    self.contributorLinkSelection = chart.linkLayer.selectAll('.contributor-link')
        .data(chart.data.contributorLinks, (d) => {
          return d._id
        });
  }
  
  /**
   * Insert new links
   */
  insertContributorLinks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.insertContributorLinks');
    let self  = this,
        chart = this.chart;
    
    self.updateContributorLinkSelection();
    
    self.contributorLinkSelection.enter()
        .append('path')
        .attr('class', 'contributor-link contributor-highlight')
        .attr('data-contributor-id', (d) => {
          return d.contributorId
        })
        .on('mouseenter', (d) => {
          if (!chart.inContributorDrag) {
            chart.svg.selectAll('.contributor-highlight[data-contributor-id="' + d.contributorId + '"]').classed('highlight', true)
          }
        })
        .on('mouseleave', (d) => {
          chart.svg.selectAll('.contributor-highlight[data-contributor-id="' + d.contributorId + '"]').classed('highlight', false)
        });
  }
  
  /**
   * Update existing links
   */
  updateContributorLinks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateContributorLinks');
    let self      = this,
        chart     = this.chart,
        startTime = Date.now();
    
    self.updateContributorLinkSelection();
    
    self.contributorLinkSelection.attr('d', (d) => {
      try {
        let source = chart.svg.select('[data-source-id="' + d.sourceId + '"]'),
            target = chart.svg.select('[data-target-id="' + d.targetId + '"]');
        
        if (source.node() && target.node()) {
          let sourceBounds = source.node().getBoundingClientRect(),
              targetBounds = target.node().getBoundingClientRect(),
              sourceSprint = (source.data() && source.data()[ 0 ] || {}).sprintNumber,
              targetSprint = (target.data() && target.data()[ 0 ] || {}).sprintNumber;
          
          sourceSprint = _.isNumber(sourceSprint) ? sourceSprint + 1 : 0;
          targetSprint = _.isNumber(targetSprint) ? targetSprint + 1 : 0;
          
          return chart.linker({
            source   : [
              sourceSprint * chart.sprintWidth,
              (sourceBounds.y - chart.bodyBounds.y) + sourceBounds.height / 2
            ], target: [
              targetSprint * chart.sprintWidth - chart.sprintBodyWidth,
              (targetBounds.y - chart.bodyBounds.y) + targetBounds.height / 2
            ]
          })
        }
      } catch (e) {
        console.error('D3CapacityPlanChart.updateContributorLinks failed to construct link:', e);
      }
    });
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateContributorLinks completed:', Date.now() - startTime);
  }
  
  /**
   * Remove any unneeded links
   */
  removeContributorLinks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.removeContributorLinks');
    let self  = this,
        chart = this.chart;
    
    self.contributorLinkSelection.exit().remove();
  }
  
  /**
   * Select all of the existing links
   */
  updateReleaseLinkSelection () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateReleaseLinkSelection');
    let self  = this,
        chart = this.chart;
    
    self.releaseLinkSelection = chart.linkLayer.selectAll('.release-link')
        .data(chart.data.releaseLinks, (d) => {
          return d._id
        });
  }
  
  /**
   * Insert new links
   */
  insertReleaseLinks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.insertReleaseLinks');
    let self  = this,
        chart = this.chart;
    
    self.updateReleaseLinkSelection();
    
    self.releaseLinkSelection.enter()
        .append('path')
        .attr('class', 'release-link release-highlight')
        .attr('data-release-id', (d) => {
          return d.releaseId
        })
        .attr('data-effort-id', (d) => {
          return d.source().dataId
        })
        .on('mouseenter', (d) => {
          if (!chart.inEffortDrag) {
            chart.svg.selectAll('.release-highlight[data-release-id="' + d.targetId + '"]').classed('highlight', true)
          }
        })
        .on('mouseleave', (d) => {
          chart.svg.selectAll('.release-highlight[data-release-id="' + d.targetId + '"]').classed('highlight', false)
        });
  }
  
  /**
   * Update existing links
   */
  updateReleaseLinks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateReleaseLinks');
    let self      = this,
        chart     = this.chart,
        startTime = Date.now();
    
    self.updateReleaseLinkSelection();
    
    self.releaseLinkSelection.attr('d', (d) => {
      try {
        let source = chart.svg.select('[data-source-id="' + d.sourceId + '"]'),
            target = chart.svg.select('[data-target-id="' + d.targetId + '"]');
        
        if (source.node() && target.node()) {
          let sourceBounds = source.node().getBoundingClientRect(),
              targetBounds = target.node().getBoundingClientRect(),
              sourceSprint = (source.data() && source.data()[ 0 ] || {}).sprintNumber,
              targetSprint = (target.data() && target.data()[ 0 ] || {}).sprintNumber;
          
          sourceSprint = _.isNumber(sourceSprint) ? sourceSprint + 1 : 0;
          targetSprint = _.isNumber(targetSprint) ? targetSprint + 1 : 0;
          
          return chart.linker({
            source   : [
              sourceBounds.x - chart.bodyBounds.x,
              (sourceBounds.y - chart.bodyBounds.y) + sourceBounds.height / 2
            ], target: [
              targetBounds.x - chart.bodyBounds.x,
              (targetBounds.y - chart.bodyBounds.y) + targetBounds.height / 2
            ]
          })
        }
      } catch (e) {
        console.error('D3CapacityPlanChart.updateReleaseLinks failed to construct link:', e);
      }
    });
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateReleaseLinks completed:', Date.now() - startTime);
  }
  
  /**
   * Remove any unneeded links
   */
  removeReleaseLinks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.removeReleaseLinks');
    let self  = this,
        chart = this.chart;
    
    self.releaseLinkSelection.exit().remove();
  }
}