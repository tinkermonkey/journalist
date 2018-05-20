import './static_assets.html';
import { Meteor }       from "meteor/meteor";
import { Template }     from 'meteor/templating';
import { StaticAssets } from '../../../../../imports/api/static_assets/static_assets';
import '../../../components/static_assets/static_asset';

/**
 * Template Helpers
 */
Template.StaticAssets.helpers({
  assets () {
    return StaticAssets.find()
  },
  uploadCallbacks: function () {
    return {
      finished: function (index, file, context) {
        Meteor.call('addStaticAsset', file.name, (error) => {
          if (error) {
            RobaDialog.error('Uploading asset failed: ' + error.toString());
          }
        });
      }
    }
  },
  assetTemplate(){
  
  }
});

/**
 * Template Event Handlers
 */
Template.StaticAssets.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    let assetId = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey = $(e.target).attr('data-key');
    
    if (assetId && dataKey) {
      Meteor.call('editStaticAsset', assetId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-delete-asset' (e, instance) {
    let asset = this;
    
    RobaDialog.ask('Delete Asset?', 'Are you sure that you want to delete the asset <span class="label label-primary"> ' + asset.key + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteStaticAsset', asset._id, function (error, response) {
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
Template.StaticAssets.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.StaticAssets.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.StaticAssets.onDestroyed(() => {
  
});
