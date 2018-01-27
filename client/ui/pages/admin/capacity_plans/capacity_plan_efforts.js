import './capacity_plan_efforts.html';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { CapacityPlanOptions } from '../../../../../imports/api/capacity_plans/capacity_plan_options';
import { CapacityPlanSprintBlocks } from '../../../../../imports/api/capacity_plans/capacity_plan_sprint_blocks';
import { CapacityPlanBlockTypes } from '../../../../../imports/api/capacity_plans/capacity_plan_block_types';
import { CapacityPlanStrategicEfforts } from '../../../../../imports/api/capacity_plans/capacity_plan_strategic_efforts';

let d3 = require('d3');

/**
 * Template Helpers
 */
Template.CapacityPlanEfforts.helpers({
  isSelectedEffort () {
    let effort         = this,
        selectedEffort = Template.instance().selectedEffort.get();
    
    return effort._id === selectedEffort
  },
  selectedEffort () {
    let selectedEffort = Template.instance().selectedEffort.get();
    
    if (selectedEffort) {
      return CapacityPlanStrategicEfforts.findOne(selectedEffort)
    }
  }
});

/**
 * Template Event Handlers
 */
Template.CapacityPlanEfforts.events({
  'click .btn-select-effort' (e, instance) {
    let effort = this;
    instance.selectedEffort.set(effort._id)
  },
  'click .btn-add-effort' (e, instance) {
    let plan         = this,
        usedColors   = CapacityPlanStrategicEfforts.find({ planId: plan._id }).map((effort) => {
          return effort.color
        }),
        unUsedColors = _.difference(instance.colorScheme, usedColors),
        nextColor    = unUsedColors.length ? unUsedColors[ 0 ] : usedColors[ 0 ];
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Effort Title'
          }
        })
      },
      title          : 'Add Planned Effort',
      width          : 500,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Add' }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = 'addRecordForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the display template
            Meteor.call('addCapacityPlanStrategicEffort', plan._id, formData.title, nextColor, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create capacity plan effort:' + error.toString())
              } else {
                RobaDialog.hide();
              }
            });
            
            AutoForm.resetForm(formId)
          }
          return;
        }
        RobaDialog.hide();
      }.bind(this)
    });
  },
  'click .btn-delete-effort' (e, instance) {
    let effort = this;
    
    RobaDialog.ask('Delete Effort?', 'Are you sure that you want to delete the effort <span class="label label-primary"> ' + effort.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteCapacityPlanStrategicEffort', effort._id, function (error, response) {
        if (error) {
          RobaDialog.error("Delete failed: " + error.message);
        }
      });
    });
  }
});

/**
 * Template Created
 */
Template.CapacityPlanEfforts.onCreated(() => {
  let instance = Template.instance();
  
  instance.selectedEffort = new ReactiveVar();
  instance.colorScheme    = d3.schemeCategory10;
  Session.set('in-effort-drag', false);
  Session.set('hover-sprint-number', null);
  
  instance.autorun(() => {
    let selectedEffort = instance.selectedEffort.get(),
        plan           = Template.currentData(),
        effortCount    = CapacityPlanStrategicEfforts.find({ planId: plan._id }).count();
    
    if (!selectedEffort && effortCount) {
      let firstEffort = CapacityPlanStrategicEfforts.findOne({ planId: plan._id }, { sort: { title: 1 } });
      if (firstEffort) {
        instance.selectedEffort.set(firstEffort._id)
      }
    }
  });
  
  instance.dragHandler = d3.drag()
      .on('start', (d) => {
        //console.log('Drag Start:', d, d3.event);
        
        Session.set('in-effort-drag', true);
        
        // Create the drag clone
        instance.dragClone = d3.select('body')
            .append('div')
            .attr('class', 'effort-drag-container');
        
        instance.dragClone.append('div')
            .attr('class', 'effort-color-swatch')
            .style('background-color', d.color);
        
        instance.dragClone.append('span')
            .text(d.title);
        
        instance.dragCursor = {
          x: 25,
          y: 20
        };
        
        instance.dragClone.classed('hide', true);
        
      })
      .on('drag', (d) => {
        let position = d3.event.sourceEvent;
        
        instance.dragClone.classed('hide', false);

        // Position the drag clone
        instance.dragClone.style('top', (position.pageY - instance.dragCursor.y) + 'px')
            .style('left', (position.pageX - instance.dragCursor.x) + 'px');
      })
      .on('end', (d) => {
        //console.log('Drag End:', d, d3.event);
        let sprintNumber   = Session.get('hover-sprint-number'),
            activeOptionId = FlowRouter.getParam('optionId');
        
        Session.set('in-effort-drag', false);
        
        // Destroy the drag clone
        instance.dragClone.remove();
        
        if (_.isNumber(sprintNumber) && activeOptionId) {
          let option           = CapacityPlanOptions.findOne(activeOptionId),
              sprintBlockCount = option.sprintBlocks(sprintNumber, CapacityPlanBlockTypes.effort).count(),
              existingBlock    = option.sprintBlock(sprintNumber, d._id);
          
          // Make sure that this doesn't already exist in this sprint
          if (!existingBlock) {
            CapacityPlanSprintBlocks.insert({
              planId      : option.planId,
              optionId    : option._id,
              sprintNumber: sprintNumber,
              order       : sprintBlockCount,
              blockType   : CapacityPlanBlockTypes.effort,
              dataId      : d._id,
              chartData   : {}
            });
          } else {
            console.error('Sprint', sprintNumber, 'already has a block for the effort', d.title, d._id);
          }
          
          Session.set('hover-sprint-number', null);
        }
      })
});

/**
 * Template Rendered
 */
Template.CapacityPlanEfforts.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    // Maintain the draggable behavior
    let plan    = Template.currentData(),
        efforts = CapacityPlanStrategicEfforts.find({ planId: plan._id }, { sort: { title: 1 } }).fetch();
    
    d3.selectAll('.btn-select-effort')
        .data(efforts)
        .call(instance.dragHandler);
  })
});

/**
 * Template Destroyed
 */
Template.CapacityPlanEfforts.onDestroyed(() => {
  
});
