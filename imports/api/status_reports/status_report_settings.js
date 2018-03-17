import { Mongo }             from 'meteor/mongo';
import SimpleSchema          from 'simpl-schema';
import { logger }            from 'meteor/austinsand:journalist-logger';
import { SchemaHelpers }     from '../schema_helpers.js';
import { CollectionDetails } from '../collection_details';

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

export const StatusReportSettings = new Mongo.Collection('status_report_settings');
StatusReportSettings.attachSchema(StatusReportSetting);

/**
 * Helpers
 */
StatusReportSettings.helpers({
  /**
   * Retrieve the source document
   */
  sourceDocument () {
    let setting = this,
        details = CollectionDetails[ setting.sourceCollection ];
    if (details) {
      return details.collection.findOne(setting.sourceId);
    } else {
      logger.error('StatusReportSettings.sourceDocument failed to find collection:', setting.sourceCollection)
    }
  },
  /**
   * Return the title or name of the document this setting pertains to
   */
  sourceLabel () {
    let setting        = this,
        sourceDocument = setting.sourceDocument();
    if (sourceDocument) {
      return sourceDocument.title || sourceDocument.name
    } else {
      logger.error('StatusReportSettings.sourceLabel failed to find source document:', setting.sourceCollection, setting.sourceId)
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
    let setting = this,
        details = CollectionDetails[ setting.sourceCollection ];
    if (details) {
      let hash                   = {};
      hash[ details.routeParam ] = setting.sourceId;
      return { hash: hash }
    } else {
      logger.error('StatusReportSettings.sourceCollectionRouteParam failed to find collection:', setting.sourceCollection)
    }
  },
  /**
   * Provide a method to get the next due date for template simplicity
   */
  dueDate () {
    return this.nextDue
  },
  /**
   * Update the due date for this report setting
   */
  updateNextDue () {
    let setting   = this,
        startDate = new Date(Math.min(new Date(), this.startDate));
    
    try {
      let nextDue = later.schedule(later.parse.text(setting.laterDirective)).next(1, startDate);
      StatusReportSettings.update(setting._id, { $set: { nextDue: nextDue } })
    } catch (e) {
    
    }
  }
});