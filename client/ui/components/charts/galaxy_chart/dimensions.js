import { Mongo }      from 'meteor/mongo';
import SimpleSchema   from 'simpl-schema';
import { DataPoints } from './data_points.js';
import { Util }       from '../../../../../imports/api/util';

let debug = true;

/**
 * ============================================================================
 * Dimensions
 * ============================================================================
 */
export const Dimension = new SimpleSchema({
  title         : {
    type: String
  },
  parentProperty: {
    type: String
  },
  nodeProperty  : {
    type: String
  }
});

export const Dimensions = new Mongo.Collection();
Dimensions.attachSchema(Dimension);

/**
 * Helpers
 */
Dimensions.helpers({
  /**
   * Get all of the datapoints for this dimension
   */
  dataPoints () {
    let dimension = this;
    
    // Get the data points for this user for this dimension
    return DataPoints.find({
      dimensionId: dimension._id
    });
  },
  
  /**
   * Map all of the dataPoints for this dimension
   */
  mapDataPoints () {
    debug && console.log(Util.timestamp(), 'Dimension.mapDataPoints: ', this.title);
    let dimension   = this,
        parentQuery = {
          dimensionId: dimension._id
        };
    
    dimension.dataPoints().forEach((dataPoint) => {
      if (dataPoint.properties && dataPoint.properties[ dimension.parentProperty ]) {
        parentQuery[ 'properties.' + dimension.nodeProperty ] = dataPoint.properties[ dimension.parentProperty ];
        
        let parentPoint = DataPoints.findOne(parentQuery);
        if (parentPoint) {
          dataPoint.setDimensionParent(dimension._id, parentPoint._id);
        } else {
          debug && console.log(Util.timestamp(), 'Dimension.mapDataPoints parent could not be found: ', parentQuery, dataPoint);
        }
      } else {
        //debug && console.log(Util.timestamp(), 'Dimension.mapDataPoints dataPoint has no parent: ', dataPoint, dimension.parentProperty);
      }
    });
  }
});