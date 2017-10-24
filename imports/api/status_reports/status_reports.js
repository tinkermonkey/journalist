import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { StatusReportStates } from './status_report_states.js';

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

export const StatusReports = new Mongo.Collection("status_reports");
StatusReports.attachSchema(StatusReport);

// These are server side only
StatusReports.deny({
  remove() {
    return true;
  },
  insert() {
    return true;
  },
  update() {
    return true;
  }
});

/**
 * Helpers
 */
StatusReports.helpers({});