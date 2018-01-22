import './editable_date_range.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.EditableDateRange.helpers({});

/**
 * Template Event Handlers
 */
Template.EditableDateRange.events({
  'click .editable-date-range' (e, instance) {
    instance.$('.editable-date-range').data('daterangepicker').show()
  }
});

/**
 * Template Created
 */
Template.EditableDateRange.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.EditableDateRange.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let context = Template.currentData();
    
    instance.$('.editable-date-range').daterangepicker(context.config, (startDate, endDate, label) => {
      context.debug && console.log('EditableDateRange firing edited:', startDate && startDate.toDate(), endDate && endDate.toDate(), label);
      instance.$('.editable-date-range').trigger('edited', [ startDate && startDate.toDate(), endDate && endDate.toDate(), label ]);
    });
  })
});

/**
 * Template Destroyed
 */
Template.EditableDateRange.onDestroyed(() => {
  
});
