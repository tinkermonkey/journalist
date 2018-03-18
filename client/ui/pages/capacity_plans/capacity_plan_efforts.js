import './capacity_plan_efforts.html';
import { Session }                      from 'meteor/session';
import SimpleSchema                     from 'simpl-schema';
import { Template }                     from 'meteor/templating';
import { RobaDialog }                   from 'meteor/austinsand:roba-dialog';
import { CapacityPlanOptions }          from '../../../../imports/api/capacity_plans/capacity_plan_options';
import { CapacityPlanSprintBlocks }     from '../../../../imports/api/capacity_plans/capacity_plan_sprint_blocks';
import { CapacityPlanBlockTypes }       from '../../../../imports/api/capacity_plans/capacity_plan_block_types';
import { CapacityPlanStrategicEfforts } from '../../../../imports/api/capacity_plans/capacity_plan_strategic_efforts';
import './capacity_plan_effort_items';
import '../../components/editable_color_picker/editable_color_picker';
import '../../components/editable_item_selector/editable_item_selector';
import '../../components/editable_item_selector/editable_item_search';

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
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let effortId = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey  = $(e.target).attr('data-key');
    
    console.log('CapacityPlanEffortItems.edited:', effortId, dataKey, newValue);
    
    if (effortId && dataKey) {
      Meteor.call('editCapacityPlanStrategicEffort', effortId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
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
          RobaDialog.error('Delete failed: ' + error.message);
        }
      });
    });
  },
});

/**
 * Template Created
 */
Template.CapacityPlanEfforts.onCreated(() => {
  let instance = Template.instance();
  
  instance.selectedEffort = new ReactiveVar();
  instance.colorScheme    = d3.schemeCategory20;
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
  
});

/**
 * Template Rendered
 */
Template.CapacityPlanEfforts.onRendered(() => {

});

/**
 * Template Destroyed
 */
Template.CapacityPlanEfforts.onDestroyed(() => {
  
});
