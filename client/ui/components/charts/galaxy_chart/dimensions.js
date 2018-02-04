import { Mongo }      from 'meteor/mongo';
import SimpleSchema   from 'simpl-schema';
import { DataPoints } from './data_points.js';

/**
 * ============================================================================
 * Dimensions
 * ============================================================================
 */
export const Dimension = new SimpleSchema({
  title: {
    type: String
  }
});

export const Dimensions = new Mongo.Collection('dimensions');
//Dimensions.attachSchema(Dimension);

/**
 * Helpers
 */
Dimensions.helpers({
  dataPoints () {
    let dimension = this,
        userId    = Meteor.userId();
    
    // Get the data points for this user for this dimension
    return DataPoints.find({
      $or: [
        { ownerId: userId },
        { sharedWith: userId }
      ]
    });
  }
});