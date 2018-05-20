import './admin_backlog_item_categories.html';
import { Template }              from 'meteor/templating';
import SimpleSchema              from 'simpl-schema';
import { BacklogItemCategories } from '../../../../../imports/api/backlogs/backlog_item_categories';

/**
 * Template Helpers
 */
Template.AdminBacklogItemCategories.helpers({
  categories () {
    return BacklogItemCategories.find({}, { sort: { title: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.AdminBacklogItemCategories.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    let categoryId = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey    = $(e.target).attr('data-key');
    
    if (categoryId && dataKey) {
      Meteor.call('editBacklogItemCategory', categoryId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-add-category' (e, instance) {
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Category Title'
          }
        })
      },
      title          : 'Add Backlog Item Category',
      width          : 500,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Add' }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = 'addRecordForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the display template
            Meteor.call('addBacklogItemCategory', formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create backlog item category:' + error.toString())
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
  'click .btn-delete-category' (e, instance) {
    let category = this;
    
    RobaDialog.ask('Delete Category?', 'Are you sure that you want to delete the item category <span class="label label-primary"> ' + category.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteBacklogItemCategory', category._id, function (error, response) {
        if (error) {
          RobaDialog.error('Delete failed: ' + error.message);
        }
      });
    });
  }
  
});

/**
 * Template Created
 */
Template.AdminBacklogItemCategories.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminBacklogItemCategories.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminBacklogItemCategories.onDestroyed(() => {
  
});
