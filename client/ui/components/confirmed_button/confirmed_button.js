import './confirmed_button.html';
import { Template } from 'meteor/templating';
import { Util }     from '../../../../imports/api/util';

/**
 * Template Helpers
 */
Template.ConfirmedButton.helpers({});

/**
 * Template Event Handlers
 */
Template.ConfirmedButton.events({
  'click .confirmed-button' (e, instance) {
    let context = this;
    
    if (instance.popover) {
      instance.popover.popover('destroy');
    }
    
    instance.popover = $(e.target).closest('.confirmed-button')
        .popover({
          placement: 'right',
          html     : true,
          content  : '<button class="btn ' + (context.btnClass || 'btn-danger') + '">' + (context.btnText || 'Confirm') + '</button>'
        })
        .popover('show');
    
    $('body').bind('click.popoverClose', instance.closePopover);
  }
});

/**
 * Template Created
 */
Template.ConfirmedButton.onCreated(() => {
  let instance = Template.instance();
  
  instance.closePopover = (e) => {
    console.log(Util.timestamp(), 'closePopover', e);
    let popoverParent = $(e.target).closest('.confirmed-button');
    
    // If the click was outside the popover, shut it down
    if (!popoverParent.length) {
      instance.popover.popover('destroy');
      $('body').unbind('click.popoverClose', instance.closePopover);
      delete instance.popover;
    }
    
  }
});

/**
 * Template Rendered
 */
Template.ConfirmedButton.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ConfirmedButton.onDestroyed(() => {
  
});
