import './json_info_link.html';
import './json_info_link.css';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.JsonInfoLink.helpers({});

/**
 * Template Event Handlers
 */
Template.JsonInfoLink.events({
  'click .json-info-link' (e, instance) {
    let context         = this,
        hoverElement    = $(e.target).closest('.json-info-link'),
        existingPopover = hoverElement.siblings('.popover');
    
    if(!existingPopover.length){
      hoverElement.addClass('pinned');
      hoverElement
          .popover({
            html   : true,
            content: '<pre class="json-info-link-content">' + JSON.stringify(context.data, null, '\t') + '</pre>',
          })
          .popover("show");
    } else {
      hoverElement.removeClass('pinned');
      hoverElement.popover("destroy");
    }
  }
});

/**
 * Template Created
 */
Template.JsonInfoLink.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.JsonInfoLink.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.JsonInfoLink.onDestroyed(() => {
  
});
