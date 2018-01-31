import './editable_item_selector.html';
import './editable_item_selector.css';
import { Template } from 'meteor/templating';
import '../editable_popover/editable_popover';
import './editable_item_search';

/**
 * Template Helpers
 */
Template.EditableItemSelector.helpers({
  popoverContext () {
    let context             = this;
    context.contentTemplate = Template.EditableItemSearch;
    context.editableClass   = 'editable-item-selector';
    return context
  }
});

/**
 * Template Event Handlers
 */
Template.EditableItemSelector.events({
});

/**
 * Template Created
 */
Template.EditableItemSelector.onCreated(() => {
});

/**
 * Template Rendered
 */
Template.EditableItemSelector.onRendered(() => {
});

/**
 * Template Destroyed
 */
Template.EditableItemSelector.onDestroyed(() => {
  
});
