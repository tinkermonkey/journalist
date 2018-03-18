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
    let self      = this,
        chart     = this.chart,
        startTime = Date.now();
    
    chart.bodyBounds = chart.scaleClientRect(chart.chartBody.node().getBoundingClientRect());
    
    // Service the contributor links
    self.insertContributorLinks();
    self.updateContributorLinks();
    self.removeContributorLinks();
    
    // Service the effort links
    self.insertEffortLinks();
    self.updateEffortLinks();
    self.removeEffortLinks();
    
    // Service the release links
    self.insertReleaseLinks();
    self.updateReleaseLinks();
    self.removeReleaseLinks();
    
    chart.debug() && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.update complete:', Date.now() - startTime);
  }
  
  /**
   * Select all of the existing links
   */
  updateContributorLinkSelection () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateContributorLinkSelection');
    let self  = this,
        chart = this.chart;
    
    self.contributorBackgroundLinkSelection = chart.backgroundLinkLayer.selectAll('.contributor-background-link')
        .data(chart.data.contributorLinks, (d) => {
          return d._id
        });
    
    self.contributorLinkSelection = chart.linkLayer.selectAll('.contributor-link')
        .data(chart.data.contributorLinks, (d) => {
          return d._id
        });
    
    self.contributorHighlightLinkSelection = chart.highlightLinkLayer.selectAll('.contributor-highlight-link')
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
    
    self.contributorBackgroundLinkSelection.enter()
        .append('path')
        .attr('class', 'contributor-background-link')
        .attr('data-contributor-id', (d) => {
          return d.contributorId
        })
        .on('mouseenter', (d) => {
          if (chart.drag === undefined) {
            chart.svg.selectAll('.contributor-highlight[data-contributor-id="' + d.contributorId + '"]').classed('highlight', true)
          }
        })
        .on('mouseleave', (d) => {
          chart.svg.selectAll('.contributor-highlight[data-contributor-id="' + d.contributorId + '"]').classed('highlight', false)
        });
    
    self.contributorLinkSelection.enter()
        .append('path')
        .attr('class', 'contributor-link')
        .attr('data-contributor-id', (d) => {
          return d.contributorId
        });
    
    self.contributorHighlightLinkSelection.enter()
        .append('path')
        .attr('class', 'contributor-highlight-link contributor-highlight')
        .attr('data-contributor-id', (d) => {
          return d.contributorId
        });
  }
  
  /**
   * Update existing links
   * @param skipSelection Skip updating the selection, for increasing performance in animations
   */
  updateContributorLinks (skipSelection) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateContributorLinks');
    let self      = this,
        chart     = this.chart,
        startTime = Date.now();
    
    if(skipSelection !== true){
      self.updateContributorLinkSelection();
    }
    
    // Initialize the position caches
    self.linkSourceCache = {};
    self.linkTargetCache = {};
    
    self.contributorLinkSelection.attr('d', self.calculateLinkWithCache.bind(self));
    self.contributorBackgroundLinkSelection.attr('d', self.calculateLinkWithCache.bind(self));
    self.contributorHighlightLinkSelection.attr('d', self.calculateLinkWithCache.bind(self));
    
    chart.debug() && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateContributorLinks completed:', Date.now() - startTime, skipSelection);
  }
  
  /**
   * Remove any unneeded links
   */
  removeContributorLinks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.removeContributorLinks');
    let self  = this,
        chart = this.chart;
    
    self.contributorBackgroundLinkSelection.exit().remove();
    self.contributorLinkSelection.exit().remove();
    self.contributorHighlightLinkSelection.exit().remove();
  }
  
  /**
   * Select all of the existing links
   */
  updateEffortLinkSelection () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateEffortLinkSelection');
    let self  = this,
        chart = this.chart;
    
    self.effortLinkSelection = chart.highlightLinkLayer.selectAll('.effort-link')
        .data(chart.data.effortLinks, (d) => {
          return d._id
        });
  }
  
  /**
   * Insert new links
   */
  insertEffortLinks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.insertEffortLinks');
    let self  = this,
        chart = this.chart;
    
    self.updateEffortLinkSelection();
    
    self.effortLinkSelection.enter()
        .append('path')
        .attr('class', 'effort-link')
        .attr('data-effort-id', (d) => {
          return d.effortId
        });
  }
  
  /**
   * Update existing links
   */
  updateEffortLinks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateEffortLinks');
    let self      = this,
        chart     = this.chart,
        startTime = Date.now();
    
    self.updateEffortLinkSelection();
    
    // Initialize the position caches
    self.linkSourceCache = {};
    self.linkTargetCache = {};
    
    self.effortLinkSelection.attr('d', self.calculateLinkWithCache.bind(self));
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateEffortLinks completed:', Date.now() - startTime);
  }
  
  /**
   * Remove any unneeded links
   */
  removeEffortLinks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.removeEffortLinks');
    let self  = this,
        chart = this.chart;
    
    self.effortLinkSelection.exit().remove();
  }
  
  /**
   * Select all of the existing links
   */
  updateReleaseLinkSelection () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateReleaseLinkSelection');
    let self  = this,
        chart = this.chart;
    
    self.releaseLinkSelection = chart.highlightLinkLayer.selectAll('.release-link')
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
        .style('stroke', 'url(#' + chart.releaseLinkGradientId + ')')
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
   * @param skipSelection Skip updating the selection, for increasing performance in animations
   */
  updateReleaseLinks (skipSelection) {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateReleaseLinks');
    let self      = this,
        chart     = this.chart,
        startTime = Date.now();
    
    if(skipSelection !== true){
      self.updateReleaseLinkSelection();
    }
    
    self.releaseLinkSelection.attr('d', (d) => {
      try {
        let source = chart.svg.select('[data-source-id="' + d.sourceId + '"]'),
            target = chart.svg.select('[data-target-id="' + d.targetId + '"]');
        
        if (source.node() && target.node()) {
          let sourceBounds = chart.scaleClientRect(source.node().getBoundingClientRect()),
              targetBounds = chart.scaleClientRect(target.node().getBoundingClientRect());
          
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
  
    chart.debug() && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateReleaseLinks completed:', Date.now() - startTime, skipSelection);
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
  
  /**
   * Using a simple in-memory cache, calculate the path of a link
   * @param link
   * @param cache
   */
  calculateLinkWithCache (link, cache) {
    let self  = this,
        chart = self.chart;
    
    try {
      let source,
          target;
      
      if (self.linkSourceCache[ link.sourceId ]) {
        source = self.linkSourceCache[ link.sourceId ];
      } else {
        let sourceEl = chart.svg.select('[data-source-id="' + link.sourceId + '"]');
        if (sourceEl && sourceEl.node()) {
          source = self.linkSourceCache[ link.sourceId ] = {
            bounds: chart.scaleClientRect(sourceEl.node().getBoundingClientRect()),
            sprint: (sourceEl.data() && sourceEl.data()[ 0 ] || {}).sprintNumber
          };
          
          // Adjust the indexing
          source.sprint = _.isNumber(source.sprint) ? source.sprint + 1 : 0;
        }
      }
      
      if (self.linkTargetCache[ link.targetId ]) {
        target = self.linkTargetCache[ link.targetId ];
      } else {
        let targetEl = chart.svg.select('[data-target-id="' + link.targetId + '"]');
        if (targetEl && targetEl.node()) {
          target = self.linkTargetCache[ link.targetId ] = {
            bounds: chart.scaleClientRect(targetEl.node().getBoundingClientRect()),
            sprint: (targetEl.data() && targetEl.data()[ 0 ] || {}).sprintNumber
          };
          
          // Adjust the indexing
          target.sprint = _.isNumber(target.sprint) ? target.sprint + 1 : 0;
        }
      }
      
      if (source && target) {
        return chart.linker({
          source   : [
            source.sprint * chart.sprintWidth,
            (source.bounds.y - chart.bodyBounds.y) + source.bounds.height / 2
          ], target: [
            target.sprint * chart.sprintWidth - chart.sprintBodyWidth,
            (target.bounds.y - chart.bodyBounds.y) + target.bounds.height / 2
          ]
        })
      }
    } catch (e) {
      console.error('D3CapacityPlanChart.updateContributorLinks failed to construct link:', e);
    }
  }
}