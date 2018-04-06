import './editable_date.html';
import { Template } from 'meteor/templating';
import '../editable_date_range/editable_date_range';

/**
 * Template Helpers
 */
Template.EditableDate.helpers({
  pickerConfig () {
    return {
      singleDatePicker: true,
      showDropdowns   : true,
      startDate       : this.value || new Date()
    }
  }
});

/**
 * Template Event Handlers
 */
Template.EditableDate.events({});

/**
 * Template Created
 */
Template.EditableDate.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.EditableDate.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.EditableDate.onDestroyed(() => {
  
});
