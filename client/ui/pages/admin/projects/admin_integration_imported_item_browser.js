import './admin_integration_imported_item_browser.html';
import { Template }   from 'meteor/templating';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import '../../../components/imported_items/imported_item_table';

/**
 * Template Helpers
 */
Template.AdminIntegrationImportedItemBrowser.helpers({
  reprocessing () {
    return Template.instance().reprocessing.get()
  },
  importedItemQuery () {
    let integration = this;
    return {
      query: { integrationId: integration._id }
    }
  }
});

/**
 * Template Event Handlers
 */
Template.AdminIntegrationImportedItemBrowser.events({
  'click .btn-reprocess-issues' (e, instance) {
    let integration = this;
    
    if (integration && integration._id) {
      instance.reprocessing.set(true);
      Meteor.call('reprocessIntegrationItems', integration._id, (error, response) => {
        instance.reprocessing.set(false);
        //console.log('reprocessIntegrationItems response:', response);
        if (error) {
          RobaDialog.error('Reprocessing failed:' + error.toString())
        }
      });
    }
  },
  'click .btn-deep-sync' (e, instance) {
    let integration = this;
    
    if (integration && integration._id) {
      instance.reprocessing.set(true);
      Meteor.call('deepSyncIntegration', integration._id, (error, response) => {
        instance.reprocessing.set(false);
        //console.log('deepSyncIntegration response:', response);
        if (error) {
          RobaDialog.error('Deep sync failed:' + error.toString())
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.AdminIntegrationImportedItemBrowser.onCreated(() => {
  let instance = Template.instance();
  
  instance.reprocessing = new ReactiveVar(false);
});

/**
 * Template Rendered
 */
Template.AdminIntegrationImportedItemBrowser.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminIntegrationImportedItemBrowser.onDestroyed(() => {
  
});
