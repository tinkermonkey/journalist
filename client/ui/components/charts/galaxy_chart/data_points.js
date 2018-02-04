import { Mongo }      from 'meteor/mongo';
import SimpleSchema   from 'simpl-schema';
import { Dimensions } from './dimensions.js';

/**
 * ============================================================================
 * DataPoints
 * ============================================================================
 */
export const DataPoint = new SimpleSchema({
  ownerId    : {
    type: String
  },
  sharedWith : {
    type    : Array,// String
    optional: true
  },
  dimensionId: {
    type: String
  },
  properties : {
    type    : Object,
    blackbox: true
  },
  parentIds  : {
    type    : Object,
    optional: true,
    blackbox: true
  }
});

export const DataPoints = new Mongo.Collection('data_points');
DataPoints.attachSchema(DataPoint);

/**
 * Helpers
 */
DataPoints.helpers({
  /**
   * Get the dimension record for this data point
   * @return Dimension
   */
  dimension () {
    let dataPoint = this;
    return Dimensions.findOne({ _id: dataPoint.dimensionId });
  },
  
  /**
   * Get the parentId for a particular dimension
   * @param dimensionId
   */
  dimensionParent (dimensionId) {
    let dataPoint = this;
    return dataPoint.parentIds && dataPoint.parentIds[ dimensionId ];
  },
  
  /**
   * Set the parent for this data point for a dimension
   * @param dimensionId
   * @param parentId
   */
  setDimensionParent (dimensionId, parentId) {
    let dataPoint = this,
        update    = {},
        key       = 'parentIds.' + dimensionId;
    
    if (dimensionId && parentId) {
      // Start with the current data
      update[ key ] = parentId;
      
      DataPoints.update({ _id: dataPoint._id }, { $set: update });
      console.log('DataPoint.setDimensionParent mapped parent:', dataPoint.properties.title, dimensionId, parentId);
    } else {
      console.error('DataPoint.setDimensionParent: missing required parameters:', dimensionId, parentId);
    }
  }
});