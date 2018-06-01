import './contributor_universe_chart.html';
import { Random }       from 'meteor/random';
import { Template }     from 'meteor/templating';
import { Contributors } from '../../../../../imports/api/contributors/contributors';
import { DataPoints }   from '../galaxy_chart/data_points';
import { Dimensions }   from '../galaxy_chart/dimensions';
import { Util }         from '../../../../../imports/api/util';
import '../galaxy_chart/universe_chart_view';

/**
 * Template Helpers
 */
Template.ContributorUniverseChart.helpers({
  dimensionId () {
    return Template.instance().activeDimensionId.get()
  }
});

/**
 * Template Event Handlers
 */
Template.ContributorUniverseChart.events({});

/**
 * Template Created
 */
Template.ContributorUniverseChart.onCreated(() => {
  let instance = Template.instance();
  
  instance.managementDimensionId = Dimensions.insert({ title: 'Management', parentProperty: 'managerId', nodeProperty: '_id' });
  instance.teamDimensionId       = Dimensions.insert({ title: 'Team', parentProperty: 'teamId', nodeProperty: '_id' });
  
  console.log(Util.timestamp(), 'ContributorUniverseChart.created managementDimensionId:', instance.managementDimensionId);
  console.log(Util.timestamp(), 'ContributorUniverseChart.created teamDimensionId:', instance.teamDimensionId);
  
  instance.activeDimensionId = new ReactiveVar(instance.managementDimensionId);
  
  instance.autorun(() => {
    console.log(Util.timestamp(), 'ContributorUniverseChart.autorun');
    let context             = Template.currentData(),
        managementDimension = Dimensions.findOne(instance.managementDimensionId),
        teamDimension       = Dimensions.findOne(instance.teamDimensionId),
        startTime           = Date.now();
    
    // Grab all of the contributors and build up the galaxy of linked contributors
    console.log(Util.timestamp(), 'ContributorUniverseChart.autorun finding contributors:', managementDimension);
    Contributors.find({
      isActive: true,
      roleId  : { $exists: true }
    }).forEach((contributor) => {
      contributor.title = contributor.name;
      let result        = DataPoints.upsert({
        dimensionId     : managementDimension._id,
        'properties._id': contributor._id,
      }, {
        $set: {
          dimensionId: managementDimension._id,
          properties : contributor
        }
      });
      //console.log(Util.timestamp(), 'ContributorUniverseChart.autorun upsert contributor result:', contributor, result);
    });
    
    // Map the parents
    managementDimension.mapDataPoints();
    
    // Update the dataPoints with the size
    DataPoints.find({ dimensionId: managementDimension._id }, { reactive: false }).forEach((dataPoint) => {
      /*
      DataPoints.update(dataPoint._id, {
        $set: {
          'properties.size': dataPoint.dimensionChildTreeIds(managementDimension._id).length
        }
      });
      */
    });
    
    console.log(Util.timestamp(), 'ContributorUniverseChart.autorun complete:', Date.now() - startTime, 'ms');
  });
});

/**
 * Template Rendered
 */
Template.ContributorUniverseChart.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ContributorUniverseChart.onDestroyed(() => {
  
});
