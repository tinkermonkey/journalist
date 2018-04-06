import './metadata_form.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.MetadataForm.helpers({});

/**
 * Template Event Handlers
 */
Template.MetadataForm.events({
  'edited .editable' (e, instance, newFieldValue) {
    e.stopImmediatePropagation();
    
    let context   = Template.currentData(),
        dataKey   = $(e.target).attr('data-key'),
        recordKey = context.recordKey || '_id',
        recordId  = context.record[ recordKey ],
        newValue  = context.record.metadata || {};
    
    // Set the edited field value
    if (dataKey) {
      newValue[ dataKey ] = newFieldValue;
    }
    
    console.log('MetadataForm.edited context:', context);
    console.log('MetadataForm.edited edit context:', recordKey, recordId, context.editFn);
    console.log('MetadataForm.edited new value:', context.record.metadata || {}, dataKey, newFieldValue, newValue);
    console.log('MetadataForm.edited edit call:', context.editFn, recordId, 'metadata', newValue);
    
    if (recordId && dataKey && context.editFn) {
      Meteor.call(context.editFn, recordId, 'metadata', newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    } else {
      console.error('MetadataForm.edited inadequate context:', context, recordKey, recordId, context.editFn);
    }
    
  }
});

/**
 * Template Created
 */
Template.MetadataForm.onCreated(() => {

});

/**
 * Template Rendered
 */
Template.MetadataForm.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.MetadataForm.onDestroyed(() => {
  
});
