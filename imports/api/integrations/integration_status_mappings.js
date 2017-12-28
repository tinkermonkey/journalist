import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ChangeTracker } from 'meteor/austinsand:roba-change-tracker';
import { SchemaHelpers } from '../schema_helpers.js';
import { ImportedItemWorkStates } from '../imported_items/imported_item_work_states';

/**
 * ============================================================================
 * IntegrationStatusMapping
 * ============================================================================
 */
export const IntegrationStatusMapping = new SimpleSchema({
  mapId     : {
    type: String
  },
  statusList: {
    type    : [ String ],
    optional: true
  },
  workState       : {
    type        : Number,
    defaultValue: ImportedItemWorkStates.needsToBeWorked
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

export const IntegrationStatusMappings = new Mongo.Collection("integration_status_mappings");
IntegrationStatusMappings.attachSchema(IntegrationStatusMapping);
ChangeTracker.trackChanges(IntegrationStatusMappings, 'IntegrationStatusMappings');

// These are server side only
IntegrationStatusMappings.deny({
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
IntegrationStatusMappings.helpers({});