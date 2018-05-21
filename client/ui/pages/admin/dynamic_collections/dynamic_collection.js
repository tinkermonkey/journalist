import './dynamic_collection.html';
import { Template }                 from 'meteor/templating';
import { DynamicCollections }       from '../../../../../imports/api/dynamic_collections/dynamic_collections';
import { DynamicCollectionManager } from '../../../../../imports/api/dynamic_collection_manager';

/**
 * Template Helpers
 */
Template.DynamicCollection.helpers({
  dynamicCollection () {
    let collectionId = FlowRouter.getParam('collectionId');
    return DynamicCollections.findOne(collectionId)
  }
});

/**
 * Template Event Handlers
 */
Template.DynamicCollection.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let collectionId = FlowRouter.getParam('collectionId'),
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
  'click .btn-recompile' (e, instance) {
    let collectionId = FlowRouter.getParam('collectionId'),
        collection   = DynamicCollections.findOne(collectionId);
    
    console.log('Recompiling collection:', collectionId);
    if (collectionId) {
      // Recompile on the server first
      Meteor.call('recompileDynamicCollection', collectionId, (error, response) => {
        if (error) {
          RobaDialog.error('Recompile failed on server:' + error.toString());
        } else {
          // Recompile locally
          try {
            DynamicCollectionManager.compileCollection(collection);
            RobaDialog.ask('Success', 'Collection recompiled');
          } catch (e) {
            RobaDialog.error('Recompile failed on client:' + error.toString());
          }
        }
      });
    }
  },
  'click .btn-export' (e, instance) {
    let dynamicCollection = this;
    
    if (dynamicCollection._id) {
      Meteor.call('exportDocument', 'DynamicCollections', dynamicCollection._id, (error, response) => {
        if (error) {
          RobaDialog.error('Export failed:' + error.toString());
        } else {
          let a = window.document.createElement('a');
          
          a.setAttribute('href', '/export/' + response);
          a.setAttribute('target', '_blank');
          a.click();
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.DynamicCollection.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.DynamicCollection.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.DynamicCollection.onDestroyed(() => {
  
});
