import './static_asset.html';
import { Template }     from 'meteor/templating';
import { StaticAssets } from '../../../../imports/api/static_assets/static_assets';

/**
 * Template Helpers
 */
Template.StaticAsset.helpers({
  asset () {
    return StaticAssets.findOne({ key: this.key })
  },
  isImage () {
    return this.type && this.type.match(/png|jpg|jpeg|gif/i)
  }
});

/**
 * Template Event Handlers
 */
Template.StaticAsset.events({});

/**
 * Template Created
 */
Template.StaticAsset.onCreated(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let asset = Template.currentData();
    
    if (asset) {
      instance.subscribe('static_asset_data', asset.key)
    }
  })
});

/**
 * Template Rendered
 */
Template.StaticAsset.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.StaticAsset.onDestroyed(() => {
  
});
