import './contributor_role_definitions.html';
import { Template } from 'meteor/templating';
import { ContributorRoleDefinitions } from '../../../../../../imports/api/contributors/contributor_role_definitions';

/**
 * Template Helpers
 */
Template.ContributorRoleDefinitions.helpers({
  roleDefinitions () {
    return ContributorRoleDefinitions.find({}, { sort: { order: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.ContributorRoleDefinitions.events({
  "edited .editable"(e, instance, newValue){
    e.stopImmediatePropagation();
    
    let definitionId  = $(e.target).closest(".sortable-table-row").attr("data-pk"),
        dataKey = $(e.target).attr("data-key");
    
    console.log('ContributorRoleDefinitions edited:', definitionId, dataKey, newValue);
    if (definitionId !== null && dataKey !== null) {
      // Create the project
      Meteor.call('editContributorRoleDefinition', definitionId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Failed to edit team role:' + error.toString())
        } else {
          RobaDialog.hide();
        }
      });
    }
  },
  "click .btn-add-definition"(e, instance){
    RobaDialog.show({
      contentTemplate: "AddRecordForm",
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Title'
          }
        })
      },
      title          : "Add Role Definition",
      width          : 500,
      buttons        : [
        { text: "Cancel" },
        { text: "Add" }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = 'addRecordForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the effort
            Meteor.call('addContributorRoleDefinition', formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create role definition:' + error.toString())
              } else {
                RobaDialog.hide();
              }
            });
            
            AutoForm.resetForm(formId)
          }
        } else {
          RobaDialog.hide();
        }
      }.bind(this)
    });
  },
});

/**
 * Template Created
 */
Template.ContributorRoleDefinitions.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ContributorRoleDefinitions.onRendered(() => {
  let instance = Template.instance();
  
  instance.$(".sortable-table")
      .sortable({
        items               : "> .sortable-table-row",
        handle              : ".drag-handle",
        helper (e, ui) {
          // fix the width
          ui.children().each(function () {
            $(this).width($(this).width());
          });
          return ui;
        },
        axis                : "y",
        forcePlaceholderSize: true,
        update (event, ui) {
          instance.$(".sortable-table-row").each(function (i, el) {
            let newOrder    = i + 1,
                storedOrder = $(el).attr("data-sort-order");
            if (newOrder !== storedOrder) {
              let rowId = $(el).attr("data-pk");

              Meteor.call('editContributorRoleDefinition', rowId, 'order', newOrder, function (error, response) {
                if (error) {
                  RobaDialog.error("Priority order update failed: " + error.message);
                }
              });
            }
          });
        }
      })
      .disableSelection();
});

/**
 * Template Destroyed
 */
Template.ContributorRoleDefinitions.onDestroyed(() => {
  
});
