import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { StatusReportStates } from './status_report_states.js';
import { CollectionDetails } from '../collection_details';

/**
 * ============================================================================
 * StatusReports
 * ============================================================================
 */
export const StatusReport = new SimpleSchema({
  // The contributor assigned to this report
  contributorId   : {
    type: String
  },
  // The name of the collection that the report is for (Tasks, Efforts, etc)
  sourceCollection: {
    type: String
  },
  // The id of the object to which this report belongs
  sourceId        : {
    type: String
  },
  // The state of this report
  state           : {
    type         : Number,
    allowedValues: _.values(StatusReportStates)
  },
  // Any miscellaneous metadata attributed to the report
  metadata        : {
    type    : Object,
    blackbox: true,
    optional: true
  },
  // The body of the report (markdown content)
  body            : {
    type    : String,
    optional: true
  },
  // The date the report is due
  dueDate         : {
    type    : Date,
    optional: true
  },
  submitDate      : {
    type    : Date,
    optional: true
  },
  // Standard tracking fields for date only
  dateCreated     : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  dateModified    : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  }
});

export const StatusReports = new Mongo.Collection('status_reports');
StatusReports.attachSchema(StatusReport);

// These are server side only
StatusReports.deny({
  remove () {
    return true;
  },
  insert () {
    return true;
  },
  update () {
    return true;
  }
});

/**
 * Helpers
 */
StatusReports.helpers({
  /**
   * Retrieve the source document
   */
  sourceDocument () {
    let report = this,
        details = CollectionDetails[ report.sourceCollection ];
    if (details) {
      return details.collection.findOne(report.sourceId);
    } else {
      console.error('StatusReports.sourceDocument failed to find collection:', report.sourceCollection)
    }
  },
  /**
   * Return the title or name of the document this setting pertains to
   */
  sourceLabel () {
    let report = this,
        sourceDocument = report.sourceDocument();
    if(sourceDocument){
      return sourceDocument.title || sourceDocument.name
    } else {
      console.error('StatusReports.sourceLabel failed to find source document:', report.sourceCollection, report.sourceId)
    }
  },
  /**
   * Retrieve the source collection details
   */
  sourceDetails () {
    let setting = this;
    
    return CollectionDetails[ setting.sourceCollection ];
  },
  /**
   * Retrieve the route param of the source collection document page
   */
  sourceRouteParamValue () {
    let report = this,
        details = CollectionDetails[ report.sourceCollection ];
    if (details) {
      let hash                   = {};
      hash[ details.routeParam ] = report.sourceId;
      return { hash: hash }
    } else {
      console.error('StatusReports.sourceCollectionRouteParam failed to find collection:', report.sourceCollection)
    }
  }
});