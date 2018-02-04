import './height_limited_content.html';
import { Template } from 'meteor/templating';

let maxHeight    = 150,
    minOverage   = 50,
    throttleTime = 250;

/**
 * Template Helpers
 */
Template.HeightLimitedContent.helpers({
  resize () {
    let instance = Template.instance();
    clearTimeout(instance.heightCheckTimeout);
    instance.heightCheckTimeout = setTimeout(() => {
      let bodyEl      = instance.$('.height-limited-content-outer'),
          outerHeight = bodyEl.innerHeight(),
          innerHeight = bodyEl.find('.height-limited-content-inner').innerHeight();
      
      //console.log(Util.timestamp(), 'Height Limited Content resize:', instance.elementId, innerHeight, outerHeight);
      
      if (Math.abs(innerHeight - outerHeight) < minOverage) {
        bodyEl.removeClass('collapsed');
        
        // Hide the controls
        instance.$('.height-limited-content-controls').hide();
      } else {
        // show the controls
        instance.$('.height-limited-content-controls').show();
        
        // size the content
        bodyEl.css('height', maxHeight);
      }
    }, throttleTime);
  }
});

/**
 * Template Event Handlers
 */
Template.HeightLimitedContent.events({
  'click .height-limited-content-controls' (e, instance) {
    let container   = $(e.target).closest('.height-limited-content-container'),
        isCollapsed = container.find('.height-limited-content-outer').hasClass('collapsed'),
        bodyEl      = instance.$('.height-limited-content-outer'),
        outerHeight = bodyEl.innerHeight(),
        innerHeight = bodyEl.find('.height-limited-content-inner').innerHeight();
    
    if (isCollapsed) {
      container.find('.height-limited-content-outer.collapsed').removeClass('collapsed');
      container.find('.height-limited-content-outer').css('height', innerHeight);
      container.find('.btn-expand-content').addClass('hide');
      container.find('.btn-collapse-content').removeClass('hide');
    } else {
      container.find('.height-limited-content-outer').addClass('collapsed');
      container.find('.height-limited-content-outer').css('height', maxHeight);
      container.find('.btn-collapse-content').addClass('hide');
      container.find('.btn-expand-content').removeClass('hide');
    }
  }
});

/**
 * Template Created
 */
Template.HeightLimitedContent.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.HeightLimitedContent.onRendered(() => {
  let instance = Template.instance();
  
  setTimeout(() => {
    let bodyEl = instance.$('.height-limited-content-outer');
    
    // Clear the max-height attribute
    bodyEl.css('max-height', '');
  }, throttleTime * 2);
  
});

/**
 * Template Destroyed
 */
Template.HeightLimitedContent.onDestroyed(() => {
  
});
