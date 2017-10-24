import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Util } from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * StatusReportSettings
 * ============================================================================
 */
export const StatusReportSetting = new SimpleSchema({
  // The name of the collection that the report is for (Tasks, Efforts, etc)
  sourceCollection: {
    type: String
  },
  // The id of the object to which this setting belongs
  sourceId: {
    type: String
  },
  laterDirective: {
    type: String
  }
});

export const StatusReportSettings = new Mongo.Collection("status_report_settings");
StatusReportSettings.attachSchema(StatusReportSetting);

/**
 * Helpers
 */
StatusReportSettings.helpers({});