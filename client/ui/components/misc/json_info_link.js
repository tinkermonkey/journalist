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
    
    if (!existingPopover.length) {
      hoverElement.addClass('pinned');
      hoverElement
          .popover({
            placement: context.placement || 'auto',
            html     : true,
            content  : '<a class="link-red pull-right btn-close" style="padding-left: 5px;"><span class="glyphicon glyphicon-remove"></span></a>' +
            '<pre class="json-info-link-content">' + JSON.stringify(context.data, null, '\t') + '</pre>',
          })
          .popover('show');
      
      // setup an event listener to handle the custom close button
      setTimeout(() => {
        hoverElement.closest('.json-info-link-container').find('.btn-close').click((e) => {
          hoverElement.removeClass('pinned');
          hoverElement.popover('destroy');
        });
      }, 100);
    } else {
      hoverElement.removeClass('pinned');
      hoverElement.popover('destroy');
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
