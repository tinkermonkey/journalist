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
    
    self.insertLinks();
    self.updateLinks();
    self.removeLinks();
  }
  
  /**
   * Select all of the existing links
   */
  updateLinkSelection () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateLinkSelection');
    let self  = this,
        chart = this.chart;
    
    self.linkSelection = chart.linkLayer.selectAll('.contributor-link')
        .data(chart.data.links, (d) => {
          return d._id
        });
  }
  
  /**
   * Insert new links
   */
  insertLinks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.insertLinks');
    let self  = this,
        chart = this.chart;
    
    self.updateLinkSelection();
    
    self.linkSelection.enter()
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
  updateLinks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateLinks');
    let self      = this,
        chart     = this.chart,
        startTime = Date.now();
    
    self.updateLinkSelection();
    
    let bodyBounds = chart.chartBody.node().getBoundingClientRect();
    self.linkSelection.attr('d', (d) => {
      try {
        let source       = chart.svg.select('[data-source-id="' + d.sourceId + '"]'),
            target       = chart.svg.select('[data-target-id="' + d.targetId + '"]');
        
        if(source.node() && target.node()){
          let sourceBounds = source.node().getBoundingClientRect(),
              targetBounds = target.node().getBoundingClientRect(),
              sourceSprint = (source.data() && source.data()[ 0 ] || {}).sprintNumber,
              targetSprint = (target.data() && target.data()[ 0 ] || {}).sprintNumber;
  
          sourceSprint = _.isNumber(sourceSprint) ? sourceSprint + 1 : 0;
          targetSprint = _.isNumber(targetSprint) ? targetSprint + 1 : 0;
  
          return chart.linker({
            source   : [
              sourceSprint * chart.sprintWidth,
              (sourceBounds.y - bodyBounds.y) + sourceBounds.height /2
            ], target: [
              targetSprint * chart.sprintWidth - chart.sprintBodyWidth,
              (targetBounds.y - bodyBounds.y) + targetBounds.height / 2
            ]
          })
        }
      } catch (e) {
        console.error('D3CapacityPlanChart.updateContributorLinks failed to construct link:', e);
      }
    });
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.updateLinks completed:', Date.now() - startTime);
  }
  
  /**
   * Remove any unneeded links
   */
  removeLinks () {
    debug && console.log(Util.timestamp(), 'D3CapacityPlanLinkHandler.removeLinks');
    let self  = this,
        chart = this.chart;
    
    self.linkSelection.exit().remove();
  }
}