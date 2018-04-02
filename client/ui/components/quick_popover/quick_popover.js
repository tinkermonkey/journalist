import './quick_popover.html';
import { Random }   from 'meteor/random';
import { Template } from 'meteor/templating';

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
        let popoverContents = $('#' + instance.elementId);
        
        // Render the search form into the popover
        try {
          instance.childView = Blaze.renderWithData(context.contentTemplate, context.data, popoverContents.get(0));
          instance.childInstance = Blaze.getView(popoverContents.get(0)).templateInstance();
          if (instance.childInstance) {
            instance.childInstance.autorun(() => {
              //console.log('QuickPopover child instance autorun');
              if (instance.childInstance.subscriptionsReady()) {
                //console.log('QuickPopover child instance subscriptions ready!');
                setTimeout(() => {
                  instance.popover.popover('reposition');
                }, 30);
                setTimeout(() => {
                  instance.popover.popover('reposition');
                }, 250);
                setTimeout(() => {
                  instance.popover.popover('reposition');
                }, 1000);
              }
              instance.popover.popover('reposition');
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
        $('.quick-popover-contents input:visible').first('').focus()
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

/**
 * Create a reposition function to call after the content is rendered
 */
$(function () {
  if (!$.fn.popover.Constructor.prototype.reposition) {
    $.fn.popover.Constructor.prototype.reposition = function () {
      let $tip      = this.tip();
      let autoPlace = true;
      
      let placement = typeof this.options.placement === 'function' ? this.options.placement.call(this, $tip[ 0 ], this.$element[ 0 ]) : this.options.placement;
      
      let pos          = this.getPosition();
      let actualWidth  = $tip[ 0 ].offsetWidth;
      let actualHeight = $tip[ 0 ].offsetHeight;
      
      if (autoPlace) {
        let orgPlacement = placement;
        let viewportDim  = this.getPosition(this.$viewport);
        
        placement = placement === 'bottom' &&
        pos.bottom + actualHeight > viewportDim.bottom ? 'top' : placement === 'top' &&
        pos.top - actualHeight < viewportDim.top ? 'bottom' : placement === 'right' &&
        pos.right + actualWidth > viewportDim.width ? 'left' : placement === 'left' &&
        pos.left - actualWidth < viewportDim.left ? 'right' : placement;
        
        $tip
            .removeClass(orgPlacement)
            .addClass(placement);
      }
      
      let calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight);
      
      this.applyPlacement(calculatedOffset, placement);
    }
  }
});