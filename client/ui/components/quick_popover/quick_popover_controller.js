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
   */
  show (contentTemplate, contentData, anchorEl, placement) {
    let controller       = this,
        popoverPlacement = $(anchorEl);
    
    // Capture the context
    controller.contentTemplate = contentTemplate;
    controller.data            = contentData;
    controller.anchorEl        = anchorEl;
    
    if (controller.popover === undefined) {
      //console.log('QuickPopoverController.show anchorEl:', anchorEl);
      
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
        controller.renderContent();
        
        // Add a click handler to close the popover if you click outside of it
        $('body').bind('click.quickPopoverClose', controller.hide);
      }, 10);
      
      // Focus on the first input
      setTimeout(() => {
        $('.quick-popover-contents input:visible').first('input').focus()
      }, 500);
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
      delete QuickPopoverController.popover;
      setTimeout(() => {
        Blaze.remove(QuickPopoverController.childView);
      }, 300)
    }
  },
  
  /**
   * Render the template and data passed
   */
  renderContent () {
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
          if (controller.childInstance.subscriptionsReady()) {
            //console.log('QuickPopover child controller subscriptions ready!');
            /*
            setTimeout(() => {
              controller.popover && controller.popover.popover('reposition');
            }, 10);
            setTimeout(() => {
              controller.popover && controller.popover.popover('reposition');
            }, 250);
            setTimeout(() => {
              controller.popover && controller.popover.popover('reposition');
            }, 1000);
            */
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