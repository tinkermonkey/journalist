import './quick_popover.html';
import './quick_popover.css';
import { Random }                 from 'meteor/random';
import { Template }               from 'meteor/templating';
import { QuickPopoverController } from './quick_popover_controller';

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
        popoverPlacement = instance.$('.quick-popover-placement'),
        contentTemplate = _.isString(context.contentTemplate) ? Template[ context.contentTemplate ] : context.contentTemplate;;
    
    if (!instance.popover && !$(e.target).closest('.btn-clear-value').length) {
      instance.popover = QuickPopoverController.show(contentTemplate, context.data, popoverPlacement.get(0), context.placement || 'auto right', true);
    } else {
      //delete instance.popover;
      QuickPopoverController.hide({
        target: popoverPlacement.get(0)
      });
    }
  },
  'hide .quick-popover-placement'(e, instance){
    delete instance.popover;
  }
});

/**
 * Template Created
 */
Template.QuickPopover.onCreated(() => {

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
