import { Meteor }       from 'meteor/meteor';
import { StaticAssets } from '../static_assets';

Meteor.publish('static_assets', function () {
  console.log('Publish: static_assets');
  return StaticAssets.find({}, { fields: { data: false } });
});

Meteor.publish('static_asset_data', function (assetKey) {
  console.log('Publish: static_asset_data', assetKey);
  return StaticAssets.find({ key: assetKey });
});

