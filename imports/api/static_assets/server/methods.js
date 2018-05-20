import { Meteor }       from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Auth }         from '../../auth';
import { StaticAssets } from '../static_assets';

let fs         = require('fs'),
    path       = require('path'),
    os         = require('os'),
    uploadPath = os.tmpdir();

Meteor.methods({
  /**
   * Add an asset
   * @param filename
   */
  addStaticAsset (filename) {
    console.log('addStaticAsset:', filename);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(filename, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      let filePath = path.join(uploadPath, filename);
      
      // Read the file
      let binData    = fs.readFileSync(filePath),
          base64Data = new Buffer(binData).toString('base64'),
          assetId    = StaticAssets.insert({
            key  : filename,
            type : path.extname(filePath),
            stats: fs.statSync(filePath),
            size : base64Data.length,
            data : base64Data
          });
      
      fs.unlinkSync(filePath);
      
      return assetId
    } else {
      console.error('Non-admin user tried to add an asset:', user.username, filename);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove an asset
   * @param assetId
   */
  deleteStaticAsset (assetId) {
    console.log('deleteStaticAsset:', assetId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(assetId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Remove all of the links to asset items
      
      StaticAssets.remove(assetId);
    } else {
      console.error('Non-admin user tried to delete an asset:', user.username, assetId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit an asset record
   * @param assetId
   * @param key
   * @param value
   */
  editStaticAsset (assetId, key, value) {
    console.log('editStaticAsset:', assetId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(assetId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the asset record to make sure this is authorized
    let asset = StaticAssets.findOne(assetId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (asset) {
        let update    = {};
        update[ key ] = value;
        
        // Update the record
        StaticAssets.update(assetId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      console.error('Non-admin tried to edit an asset:', user.username, key, assetId);
      throw new Meteor.Error(403);
    }
  },
});
