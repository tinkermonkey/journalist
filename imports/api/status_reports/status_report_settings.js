import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { Contributors } from '../contributors/contributors';
import { Efforts } from '../efforts/efforts';
import { Projects } from '../projects/projects';
import { Tasks } from '../tasks/tasks';
import { Teams } from '../teams/teams';

let collectionMap      = {
      Contributors: Contributors,
      Efforts     : Efforts,
      Projects    : Projects,
      Tasks       : Tasks,
      Teams       : Teams
    },
    collectionTitleMap = {
      Contributors: 'Contributor',
      Efforts     : 'Effort',
      Projects    : 'Project',
      Tasks       : 'Task',
      Teams       : 'Team'
    },
    sourceCollectionRouteNameMap = {
      Contributors: 'ContributorHome',
      Efforts     : 'Effort',
      Projects    : 'ProjectHome',
      Tasks       : 'Task',
      Teams       : 'TeamHome'
    },
    sourceCollectionRouteParamMap = {
      Contributors: 'contributorId',
      Efforts     : 'effortId',
      Projects    : 'projectId',
      Tasks       : 'taskId',
      Teams       : 'teamId'
    };

/**
 * ============================================================================
 * StatusReportSettings
 * ============================================================================
 */
export const StatusReportSetting = new SimpleSchema({
  // The contributor assigned to produce a report based on this setting
  contributorId   : {
    type: String
  },
  // The name of the collection that the report is for (Tasks, Efforts, etc)
  sourceCollection: {
    type: String
  },
  // The id of the object to which this setting belongs
  sourceId        : {
    type: String
  },
  // Schedule definition
  laterDirective  : {
    type        : String,
    defaultValue: 'at 3:00pm on Friday'
  },
  // Date to begin the schedule
  startDate       : {
    type: Date
  },
  nextDue         : {
    type    : Date,
    optional: true
  },
  // Standard tracking fields
  dateCreated     : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy       : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified    : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy      : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const StatusReportSettings = new Mongo.Collection("status_report_settings");
StatusReportSettings.attachSchema(StatusReportSetting);

/**
 * Helpers
 */
StatusReportSettings.helpers({
  /**
   * Retrieve the source document
   */
  sourceDocument(){
    let setting    = this,
        collection = collectionMap[ setting.sourceCollection ];
    if (collection) {
      return collection.findOne(setting.sourceId);
    } else {
      console.error('StatusReportSettings.sourceDocument failed to find collection:', setting.sourceCollection)
    }
  },
  /**
   * Retrieve the title of source collection
   */
  sourceCollectionTitle(){
    let setting    = this,
        title = collectionTitleMap[ setting.sourceCollection ];
    if (title) {
      return title
    } else {
      console.error('StatusReportSettings.sourceCollectionTitle failed to find collection:', setting.sourceCollection)
    }
  },
  /**
   * Retrieve the route of the source collection document page
   */
  sourceCollectionRouteName(){
    let setting    = this,
        routeName = sourceCollectionRouteNameMap[ setting.sourceCollection ];
    if (routeName) {
      return routeName
    } else {
      console.error('StatusReportSettings.sourceCollectionRouteName failed to find collection:', setting.sourceCollection)
    }
  },
  /**
   * Retrieve the route param of the source collection document page
   */
  sourceCollectionRouteParam(){
    let setting    = this,
        paramName = sourceCollectionRouteParamMap[ setting.sourceCollection ];
    if (paramName) {
      let hash = {};
      hash[paramName] = setting.sourceId;
      return {hash: hash}
    } else {
      console.error('StatusReportSettings.sourceCollectionRouteParam failed to find collection:', setting.sourceCollection)
    }
  }
});