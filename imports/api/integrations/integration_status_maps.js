import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { SchemaHelpers } from '../schema_helpers.js';
import { IntegrationServers } from './integration_servers';

/**
 * ============================================================================
 * IntegrationStatusMaps
 * ============================================================================
 */
export const IntegrationStatusMap = new SimpleSchema({
  title       : {
    type: String
  },
  serverId    : {
    type: String
  },
  // Mapping of a remote status identifier to a work state and work phase
  // This serves as a lookup for those two items which will be set as attributes on the importedItem doc
  mapping     : {
    type    : Object,
    blackbox: true,
    optional: true
  },
  // Standard tracking fields
  dateCreated : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy   : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified: {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy  : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const IntegrationStatusMaps = new Mongo.Collection("integration_status_maps");
IntegrationStatusMaps.attachSchema(IntegrationStatusMap);
ChangeTracker.trackChanges(IntegrationStatusMaps, 'IntegrationStatusMaps');

// These are server side only
IntegrationStatusMaps.deny({
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
IntegrationStatusMaps.helpers({
  server () {
    return IntegrationServers.findOne(this.serverId)
  },
  /**
   * Get the list of mapped statuses for a phase and state combination
   * @param workPhaseKey
   * @param workStateKey
   * @return {[String]}
   */
  mappedPhaseStatuses (workPhaseKey, workStateKey) {
    let map           = this,
        phaseStatuses = [];
    
    if (_.isObject(map.mapping)) {
      _.keys(map.mapping).forEach((statusId) => {
        if (map.mapping[ statusId ].workPhase === workPhaseKey && map.mapping[ statusId ].workState === workStateKey) {
          phaseStatuses.push(map.mapping[ statusId ])
        }
      })
    }
    
    //console.log('IntegrationStatusMaps.mappedPhaseStatuses:', this, workPhaseKey, workStateKey);
    
    return phaseStatuses
  }
});