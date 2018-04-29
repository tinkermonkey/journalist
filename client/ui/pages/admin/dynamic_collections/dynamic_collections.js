import './dynamic_collections.html';
import { Template }           from 'meteor/templating';
import { DynamicCollections } from '../../../../../imports/api/dynamic_collections/dynamic_collections';
import SimpleSchema           from 'simpl-schema';

/**
 * Template Helpers
 */
Template.DynamicCollections.helpers({
  dynamicCollections () {
    return DynamicCollections.find({}, { sort: { title: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.DynamicCollections.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let collectionId = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey      = $(e.target).attr('data-key');
    
    console.log('edited:', collectionId, dataKey, newValue);
    if (collectionId && dataKey) {
      Meteor.call('editDynamicCollection', collectionId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-add-dynamic-collection' (e, instance) {
    let context = Template.currentData();
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Title'
          }
        })
      },
      title          : 'Add Dynamic Collection',
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
            
            // Create the collection
            Meteor.call('addDynamicCollection', formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create dynamic collection:' + error.toString())
              } else {
                RobaDialog.hide();
              }
            });
            
            AutoForm.resetForm(formId)
          }
          return;
        }
        RobaDialog.hide();
      }.bind(this)
    });
  },
  'click .btn-delete-dynamic-collection' (e, instance) {
    let collection = this;
    
    RobaDialog.ask('Delete Dynamic Collection?', 'Are you sure that you want to delete the dynamic collection <span class="label label-primary"> ' + collection.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteDynamicCollection', collection._id, function (error, response) {
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
Template.DynamicCollections.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('dynamic_collections');
});

/**
 * Template Rendered
 */
Template.DynamicCollections.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.DynamicCollections.onDestroyed(() => {
  
});
