import { Template } from "meteor/templating";
import { Random }   from 'meteor/random';
import './quick_popover.css';

export const QuickPopoverController = {
  /**
   * Show content in a popover anchored to the specific dom element
   * @param contentTemplate
   * @param contentData
   * @param anchorEl
   * @param placement
   * @param reposition
   */
  show (contentTemplate, contentData, anchorEl, placement, reposition) {
    let controller       = this,
        popoverPlacement = $(anchorEl);
    
    // Capture the context
    controller.contentTemplate = contentTemplate;
    controller.data            = contentData;
    controller.anchorEl        = anchorEl;
    
    if (controller.popover === undefined) {
      //console.log('QuickPopoverController.show anchorEl:', anchorEl);
      
      // Possibly correct the placement
      if (placement.match(/left|right/i)) {
        let bounds      = popoverPlacement.get(0).getBoundingClientRect(),
            windowWidth = window.innerWidth;
        
        if (bounds.right > windowWidth / 2 && placement.match(/right/i) && placement.match(/auto/i)) {
          console.log('QuickPopoverController placement change:', placement, '->', 'left');
          placement = 'left';
        } else if (bounds.left < windowWidth / 2 && placement.match(/left/i) && placement.match(/auto/i)) {
          console.log('QuickPopoverController placement change:', placement, '->', 'left');
          placement = 'right';
        }
      }
      
      controller.elementId = Random.id();
      controller.popover   = popoverPlacement
          .popover({
            placement: placement || 'auto bottom',
            html     : true,
            content  : '<div class="quick-popover-contents" id="' + controller.elementId + '"></div>'
          })
          .popover('show');
      
      // Render the contents
      setTimeout(() => {
        controller.renderContent(reposition);
        
        // Add a click handler to close the popover if you click outside of it
        $('body').bind('click.quickPopoverClose', controller.hide);
      }, 10);
      
      // Focus on the first input
      setTimeout(() => {
        $('.quick-popover-contents input:visible').first('input').focus()
      }, 500);
      
      return controller.popover
    } else {
      controller.renderContent();
    }
  },
  
  /**
   * Hide the popover
   * @param e
   * @param force
   */
  hide (e, force) {
    let popoverParent = $(e.target).closest('.quick-popover');
    
    // If the click was outside the popover, shut it down
    if (QuickPopoverController.popover && (!popoverParent.length || force === true)) {
      QuickPopoverController.popover.popover('destroy');
      $('body').unbind('click.quickPopoverClose', QuickPopoverController.hide);
      QuickPopoverController.anchorEl && $(QuickPopoverController.anchorEl).trigger('hide');
      delete QuickPopoverController.popover;
      setTimeout(() => {
        Blaze.remove(QuickPopoverController.childView);
      }, 300)
    }
  },
  
  /**
   * Determine if the popover is currently show
   * @param template (optional) If passed, will be
   */
  isVisible (template) {
    if (template) {
      return QuickPopoverController.popover && QuickPopoverController.contentTemplate === template
    } else {
      return QuickPopoverController.popover !== undefined
    }
  },
  
  /**
   * Render the template and data passed
   * @param reposition Should the popover auto-reposition
   */
  renderContent (reposition) {
    let controller      = this,
        popoverContents = $('#' + controller.elementId),
        template        = _.isString(controller.contentTemplate) ? Template[ controller.contentTemplate ] : controller.contentTemplate;
    
    // Empty the popover
    popoverContents.empty();
    
    //console.log('QuickPopoverController.show rendering child template:', popoverContents, template, controller.data);
    
    // Render the search form into the popover
    try {
      controller.childView          = Blaze.renderWithData(template, controller.data, popoverContents.get(0));
      controller.childViewConfirmed = Blaze.getView(popoverContents.children().first().get(0));
      
      //console.log('QuickPopoverController.show controller.childView:', controller.childView);
      //console.log('QuickPopoverController.show controller.childViewConfirmed:', popoverContents.children().first()
      //    .get(0), controller.childViewConfirmed);
      
      controller.childInstance = controller.childViewConfirmed && controller.childViewConfirmed.templateInstance();
      //controller.childInstance = controller.childView && controller.childView.templateInstance();
      if (controller.childInstance) {
        controller.childInstance.autorun(() => {
          //console.log('QuickPopover child controller autorun');
          if (controller.childInstance.subscriptionsReady() && reposition) {
            //console.log('QuickPopover child controller subscriptions ready!');
            setTimeout(() => {
              controller.popover && controller.popover.popover('reposition');
            }, 10);
            setTimeout(() => {
              controller.popover && controller.popover.popover('reposition');
            }, 250);
            setTimeout(() => {
              controller.popover && controller.popover.popover('reposition');
            }, 1000);
            setTimeout(() => {
              controller.popover && controller.popover.popover('reposition');
            }, 3000);
          }
          controller.popover && controller.popover.popover('reposition');
        });
      }
    } catch (e) {
      console.error('QuickPopover rendering content template failed:', e);
      RobaDialog.error('QuickPopover rendering content template failed:' + e.toString());
    }
    
    // Add a custom class
    popoverContents.closest('.popover').addClass('quick-popover');
  }
};

/**
 * Create a reposition function to call after the content is rendered
 */
$(function () {
  if (!$.fn.popover.Constructor.prototype.reposition) {
    $.fn.popover.Constructor.prototype.reposition = function () {
      let popover          = this,
          $tip             = popover.tip(),
          placement        = typeof popover.options.placement === 'function' ? this.options.placement.call(popover, $tip[ 0 ], popover.$element[ 0 ]) : popover.options.placement,
          pos              = popover.getPosition(),
          actualWidth      = $tip[ 0 ].offsetWidth,
          actualHeight     = $tip[ 0 ].offsetHeight,
          calculatedOffset = popover.getCalculatedOffset(placement, pos, actualWidth, actualHeight);
      
      popover.applyPlacement(calculatedOffset, placement);
      
      if (placement.match(/left/i)) {
        $tip.css('left', '');
        let container    = $tip.closest('.container'),
            pointerWidth = $tip.find('.arrow').width() || 10;
        if (container) {
          let containerBounds = container.get(0).getBoundingClientRect();
          $tip.css('right', (containerBounds.right - pos.left + pointerWidth) + 'px');
        } else {
          $tip.css('right', (window.innerWidth - pos.left + pointerWidth) + 'px');
        }
        //console.log('reposition:', placement, pos, window.innerWidth, $tip.css('right'));
      }
    }
  }
});