import { Mongo }      from 'meteor/mongo';
import SimpleSchema   from 'simpl-schema';
import { Dimensions } from './dimensions.js';
import { Util }       from '../../../../../imports/api/util';

/**
 * ============================================================================
 * DataPoints
 * ============================================================================
 */
export const DataPoint = new SimpleSchema({
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

export const DataPoints = new Mongo.Collection();
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
    if (dataPoint.parentIds && dataPoint.parentIds[ dimensionId ]) {
      //console.log(Util.timestamp(), 'DataPoint dimensionParent', dataPoint._id, dimensionId, dataPoint.parentIds[ dimensionId ]);
    } else {
      //console.log(Util.timestamp(), 'DataPoint dimensionParent found nothing', dataPoint._id, dimensionId);
    }
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
      //console.log('DataPoint.setDimensionParent mapped parent:', dataPoint.properties.title, dimensionId, parentId);
    } else {
      console.error('DataPoint.setDimensionParent: missing required parameters:', dimensionId, parentId);
    }
  },
  
  /**
   * Get the immediate children for this DataPoint for a given dimension
   * @param dimensionId
   */
  dimensionChildren (dimensionId) {
    let query                           = {};
    query[ 'parentIds.' + dimensionId ] = this._id;
    return DataPoints.find(query)
  },
  
  /**
   * Get the tree of dataPoints that link to this dataPoint
   * @param dimensionId
   * @param depth
   */
  dimensionChildTree (dimensionId, depth) {
    let dataPoint = _.clone(this);
    
    depth = depth || 0;
    
    if (depth < 100) {
      dataPoint.children = dataPoint.dimensionChildren(dimensionId).map((child) => {
        return child.dimensionChildTree(dimensionId, depth + 1)
      });
      dataPoint.depth    = dataPoint.children.reduce((maxDepth, d) => {
        return Math.max(d.depth, maxDepth)
      }, depth);
    } else {
      console.error('dimensionChildTree reached recursion limit:', depth, dataPoint);
    }
    
    return dataPoint
  },
  
  /**
   * Get the list of dataPoint _ids that link to this dataPoint
   * @param dimensionId
   * @param depth
   */
  dimensionChildTreeIds (dimensionId, depth) {
    let dataPoint = this;
  
    depth = depth || 0;
    
    if (depth < 100) {
      return _.flatten(dataPoint.dimensionChildren(dimensionId).map((d) => {
        return d._id
      }).concat(dataPoint.dimensionChildren(dimensionId).map((d) => {
        return d.dimensionChildTreeIds(dimensionId, depth + 1)
      })))
    } else {
      console.error('dimensionChildTreeIds reached recursion limit:', depth, dataPoint);
      return dataPoint.dimensionChildren(dimensionId).map((d) => {
        return d._id
      })
    }
  }
});