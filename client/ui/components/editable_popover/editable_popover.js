import './editable_popover.html';
import './editable_popover.css';
import { Template } from 'meteor/templating';
import '../editable_item_selector/editable_item_search';

/**
 * Template Helpers
 */
Template.EditablePopover.helpers({});

/**
 * Template Event Handlers
 */
Template.EditablePopover.events({
  'click .editable-popover-value' (e, instance) {
    let context          = this,
        popoverPlacement = instance.$('.editable-popover-placement');
    
    if (instance.popover === undefined && !$(e.target).closest('.btn-clear-value').length) {
      instance.popover = popoverPlacement
          .popover({
            placement: context.placement || 'bottom',
            html     : true,
            content  : '<div class="editable-popover-contents"></div>'
          })
          .popover('show');
      
      // Render the contents
      setTimeout(() => {
        let popoverContents = $('.editable-popover-contents');
        
        // Render the search form into the popover
        instance.childView = Blaze.renderWithData(context.contentTemplate, context, popoverContents.get(0));
        
        // Add a custom class
        popoverContents.closest('.popover').addClass('editable-popover');
        
        // Add a click handler to close the popover if you click outside of it
        $('body').bind('click.popoverClose', instance.closePopover);
      }, 10);
      
      // Focus on the first input
      setTimeout(() => {
        $('.editable-popover-contents input:visible').first('').focus()
      }, 500);
    }
  },
  'edited .editable-popover-container' (e, instance) {
    // Trap the event
    e.stopImmediatePropagation();
    
    // Close the popover
    instance.closePopover(e, true);
    
    // Re-fire edited events so they emanate from the correct element
    let args = Array.from(arguments).slice(2);
    instance.$('.editable-popover-value').trigger('edited', args);
  },
  'click .btn-clear-value' (e, instance) {
    console.log('Clearing value');
    instance.$('.editable-popover-value').trigger('edited', []);
  }
});

/**
 * Template Created
 */
Template.EditablePopover.onCreated(() => {
  let instance = Template.instance();
  
  instance.closePopover = function (e, force) {
    let popoverParent = $(e.target).closest('.editable-popover');
    
    // If the click was outside the popover, shut it down
    if (!popoverParent.length || force === true) {
      Blaze.remove(instance.childView);
      instance.popover.popover('destroy');
      $('body').unbind('click.popoverClose', instance.closePopover);
      delete instance.popover;
    }
  };
});

/**
 * Template Rendered
 */
Template.EditablePopover.onRendered(() => {
});

/**
 * Template Destroyed
 */
Template.EditablePopover.onDestroyed(() => {
  
});
