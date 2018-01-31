import './editable_color_picker.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.EditableColorPicker.helpers({});

/**
 * Template Event Handlers
 */
Template.EditableColorPicker.events({});

/**
 * Template Created
 */
Template.EditableColorPicker.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.EditableColorPicker.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let context     = Template.currentData(),
        minFireTime = context.minFireTime || 500;
    
    instance.lastFireTime = 0;
    
    if (instance.colorPicker) {
      let colorPicker = instance.$('.editable-color-picker-swatch').data('colorpicker');
      
      if (colorPicker.getValue() !== context.value) {
        instance.lastFireTime = 0;
        colorPicker.setValue(context.value);
      }
    } else {
      instance.colorPicker = instance.$('.editable-color-picker-swatch').colorpicker({
        color      : context.value || '#fff',
        format     : 'hex',
        useAlpha   : false,
        customClass: 'colorpicker-2x',
        sliders: {
          saturation: {
            maxLeft: 200,
            maxTop: 200
          },
          hue: {
            maxTop: 200
          },
          alpha: {
            maxTop: 200
          }
        }
      }).on('changeColor', (e) => {
        if (Date.now() - instance.lastFireTime > minFireTime) {
          instance.lastFireTime = Date.now();
          context.debug && console.log('EditableColorPicker firing edited:', e.color && e.color.toString('hex'));
          instance.$('.editable-color-picker').trigger('edited', [ e.color && e.color.toString('hex') ]);
        } else {
          clearTimeout(instance.fireTimeout);
          instance.fireTimeout = setTimeout(() => {
            instance.lastFireTime = Date.now();
            context.debug && console.log('EditableColorPicker firing edited:', e.color && e.color.toString('hex'));
            instance.$('.editable-color-picker').trigger('edited', [ e.color && e.color.toString('hex') ]);
          }, minFireTime)
        }
      });
    }
  });
});

/**
 * Template Destroyed
 */
Template.EditableColorPicker.onDestroyed(() => {
  
});
