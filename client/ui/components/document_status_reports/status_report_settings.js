import './status_report_settings.html';
import { Template } from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { StatusReportSettings } from '../../../../imports/api/status_reports/status_report_settings';
import '../later_preview/later_preview.js';

/**
 * Template Helpers
 */
Template.StatusReportSettings.helpers({
  settings(){
    let context = this;
    if(context.sourceCollection && context.sourceId){
      return StatusReportSettings.findOne({
        sourceCollection: context.sourceCollection,
        sourceId: context.sourceId
      })
    }
  }
});

/**
 * Template Event Handlers
 */
Template.StatusReportSettings.events({
  "edited .editable"(e, instance, newValue){
    e.stopImmediatePropagation();
    
    let settingsId  = $(e.target).closest(".status-report-settings").attr("data-pk"),
        dataKey = $(e.target).attr("data-key");
    
    console.log('StatusReportSettings edited:', settingsId, dataKey, newValue);
    if (settingsId && dataKey) {
      Meteor.call('editStatusReportSetting', settingsId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Failed to edit report settings: ' + error.toString())
        } else {
          RobaDialog.hide();
        }
      });
    }
  },
  "click .configure-reporting-button"(e, instance){
    e.stopImmediatePropagation();
    
    let context = instance.data;
    
    console.log('StatusReportSettings creating setting:', context);
    if (context.contributorId && context.sourceCollection && context.sourceId) {
      Meteor.call('addStatusReportSetting', context.contributorId , context.sourceCollection , context.sourceId, (error, response) => {
        if (error) {
          RobaDialog.error('Failed to add report settings: ' + error.toString())
        } else {
          RobaDialog.hide();
        }
      });
    } else {
      RobaDialog.error('Failed to add reporting settings: insufficient context in ' + JSON.stringify(context))
    }
  },
  "click .btn-delete-settings"(e, instance, newValue){
    e.stopImmediatePropagation();
  
    let settingsId  = $(e.target).closest(".status-report-settings").attr("data-pk");
    
    RobaDialog.ask('Delete Settings?', 'Are you sure that you want to delete the report settings?', () => {
      RobaDialog.hide();
      Meteor.call('deleteStatusReportSetting', settingsId, function (error, response) {
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
Template.StatusReportSettings.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.StatusReportSettings.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.StatusReportSettings.onDestroyed(() => {
  
});
