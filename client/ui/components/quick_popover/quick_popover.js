import './quick_popover.html';
import './quick_popover.css';
import { Random }   from 'meteor/random';
import { Template } from 'meteor/templating';
import './quick_popover_controller';

/**
 * Template Helpers
 */
Template.QuickPopover.helpers({});

/**
 * Template Event Handlers
 */
Template.QuickPopover.events({
  'click .quick-popover-click' (e, instance) {
    let context          = this,
        popoverPlacement = instance.$('.quick-popover-placement');
    
    if (instance.popover === undefined && !$(e.target).closest('.btn-clear-value').length) {
      instance.elementId = Random.id();
      instance.popover   = popoverPlacement
          .popover({
            placement: context.placement || 'auto right',
            html     : true,
            content  : '<div class="quick-popover-contents" id="' + instance.elementId + '"></div>'
          })
          .popover('show');
      
      // Render the contents
      setTimeout(() => {
        let popoverContents = $('#' + instance.elementId),
            template        = _.isString(context.contentTemplate) ? Template[ context.contentTemplate ] : context.contentTemplate;
        
        // Render the search form into the popover
        try {
          instance.childView     = Blaze.renderWithData(template, context.data, popoverContents.get(0));
          instance.childInstance = Blaze.getView(popoverContents.get(0)).templateInstance();
          if (instance.childInstance) {
            instance.childInstance.autorun(() => {
              //console.log('QuickPopover child instance autorun');
              if (instance.childInstance.subscriptionsReady()) {
                //console.log('QuickPopover child instance subscriptions ready!');
                setTimeout(() => {
                  instance.popover && instance.popover.popover('reposition');
                }, 30);
                setTimeout(() => {
                  instance.popover && instance.popover.popover('reposition');
                }, 250);
                setTimeout(() => {
                  instance.popover && instance.popover.popover('reposition');
                }, 1000);
              }
              instance.popover && instance.popover.popover('reposition');
            });
          }
        } catch (e) {
          console.error('QuickPopover rendering content template failed:', e);
          RobaDialog.error('QuickPopover rendering content template failed:' + e.toString());
        }
        
        // Add a custom class
        popoverContents.closest('.popover').addClass('quick-popover');
        
        // Add a click handler to close the popover if you click outside of it
        $('body').bind('click.quickPopoverClose', instance.closePopover);
      }, 10);
      
      // Focus on the first input
      setTimeout(() => {
        $('.quick-popover-contents input:visible').first('input').focus()
      }, 500);
    } else {
      instance.closePopover({
        target: instance.firstNode
      }, true)
    }
  }
});

/**
 * Template Created
 */
Template.QuickPopover.onCreated(() => {
  let instance = Template.instance();
  
  instance.closePopover = function (e, force) {
    let popoverParent = $(e.target).closest('.quick-popover');
    
    // If the click was outside the popover, shut it down
    if (!popoverParent.length || force === true) {
      instance.popover.popover('destroy');
      $('body').unbind('click.quickPopoverClose', instance.closePopover);
      delete instance.popover;
      setTimeout(() => {
        Blaze.remove(instance.childView);
      }, 300)
    }
  };
});

/**
 * Template Rendered
 */
Template.QuickPopover.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.QuickPopover.onDestroyed(() => {
  
});
