import './editable_later_directive.html';
import './editable_later_directive.css';
import { Template } from 'meteor/templating';
import 'meteor/natestrauser:x-editable-bootstrap';
import '../quick_popover/quick_popover';
import './later_preview';

/**
 * Template Helpers
 */
Template.EditableLaterDirective.helpers({
  previewTemplate () {
    return Template.LaterPreview
  }
});

/**
 * Template Event Handlers
 */
Template.EditableLaterDirective.events({});

/**
 * Template Created
 */
Template.EditableLaterDirective.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.EditableLaterDirective.onRendered(() => {
  let instance       = Template.instance(),
      editableConfig = {
        mode     : instance.data.mode || "inline",
        placement: instance.data.placement,
        value    : instance.data.value,
        emptyText: instance.data.emptyText || "empty",
        highlight: false,
        display  : function () {
        },
        success  : function (response, newValue) {
          let editedElement = $(this).closest(".editable-later-directive");
          editedElement.trigger("edited", [ newValue ]);
          setTimeout(function () {
            editedElement.find('.editable-unsaved').removeClass('editable-unsaved');
          }, 10);
        }
      };
  
  // Accommodate passing html5 field pattern regex
  if (instance.data.pattern) {
    editableConfig.tpl = '<input type="text" pattern="' + instance.data.pattern + '" title="' + (instance.data.validationMessage || '') + '">';
  }
  
  instance.$(".editable-click").editable(editableConfig);
  
  instance.autorun(function () {
    let data = Template.currentData();
    instance.$(".editable-click").editable("setValue", data.value);
  });
});

/**
 * Template Destroyed
 */
Template.EditableLaterDirective.onDestroyed(() => {
  
});
