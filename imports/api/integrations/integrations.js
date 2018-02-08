import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {ChangeTracker} from 'meteor/austinsand:roba-change-tracker';
import {Util} from '../util.js';
import {SchemaHelpers} from '../schema_helpers.js';
import {IntegrationCalculatedFields} from './integration_calculated_fields';
import {IntegrationImportFunctions} from './integration_import_functions';
import {IntegrationServers} from './integration_servers';
import {ItemTypes} from '../imported_items/item_types';
import {Projects} from '../projects/projects';

/**
 * ============================================================================
 * Integrations
 * ============================================================================
 */
export const Integration = new SimpleSchema({
  // Project to which this integration belongs
  projectId: {
    type: String
  },
  // The server to fetch data from
  serverId: {
    type: String
  },
  // Type of items this integration provides
  itemType: {
    type: SimpleSchema.Integer,
    allowedValues: _.values(ItemTypes)
  },
  // The _id of the integration import function to use
  importFunctionId: {
    type: String,
    optional: true
  },
  // The _id of the integration display template to use for previewing items
  previewDisplayTemplateId: {
    type: String,
    optional: true
  },
  // The _id of the integration display template to use for details views of items
  detailDisplayTemplateId: {
    type: String,
    optional: true
  },
  // The list of _id of the calculated fields to use
  calculatedFieldIds: {
    type: Array, // String
    optional: true
  },
  'calculatedFieldIds.$': {
    type: String
  },
  // The frequency of the basic update task
  updateFrequency: {
    type: String,
    defaultValue: 'every 5 minutes'
  },
  // The frequency of the basic update task
  deepSyncFrequency: {
    type: String,
    defaultValue: 'at 1:00am every day'
  },
  // Configuration blob
  details: {
    type: Object,
    blackbox: true,
    optional: true
  },
  // Standard tracking fields
  dateCreated: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified: {
    type: Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy: {
    type: String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const Integrations = new Mongo.Collection('integrations');
Integrations.attachSchema(Integration);
ChangeTracker.trackChanges(Integrations, 'Integrations');

// These are server side only
Integrations.deny({
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
Integrations.helpers({
  itemTypeTitle() {
    return Util.camelToTitle(_.invert(ItemTypes)[this.itemType])
  },
  importFunction() {
    return IntegrationImportFunctions.findOne({_id: this.importFunctionId})
  },
  project() {
    return Projects.findOne({_id: this.projectId})
  },
  server() {
    return IntegrationServers.findOne({_id: this.serverId})
  },
  calculatedFields() {
    if (this.calculatedFieldIds && this.calculatedFieldIds.length) {
      return IntegrationCalculatedFields.find({_id: {$in: this.calculatedFieldIds}}, {sort: {title: 1}});
    }
  }
});