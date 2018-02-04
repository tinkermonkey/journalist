import { Mongo }                          from 'meteor/mongo';
import SimpleSchema                       from 'simpl-schema';
import { SchemaHelpers }                  from '../schema_helpers.js';
import { IntegrationTypes }               from './integration_types';
import { IntegrationServerAuthProviders } from './integration_server_auth_providers';

/**
 * ============================================================================
 * IntegrationServers
 * ============================================================================
 */
export const IntegrationServer = new SimpleSchema({
  title               : {
    type: String
  },
  integrationType     : {
    type         : SimpleSchema.Integer,
    allowedValues: _.values(IntegrationTypes)
  },
  baseUrl             : {
    type: String
  },
  authData            : {
    type    : Object,
    blackbox: true,
    optional: true
  },
  healthCheckFrequency: {
    type        : String,
    defaultValue: 'every 5 minutes'
  },
  cacheUpdateFrequency: {
    type        : String,
    defaultValue: 'every 30 minutes'
  },
  // Mapping of a remote status identifier to a work state and work phase
  // This serves as a lookup for those two items which will be set as attributes on the importedItem doc
  statusMap           : {
    type    : Object,
    blackbox: true,
    optional: true
  },
  isActive            : {
    type        : Boolean,
    optional    : true,
    defaultValue: false
  },
  isAuthenticated     : {
    type        : Boolean,
    optional    : true,
    defaultValue: false
  },
  // Standard tracking fields
  dateCreated         : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy           : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified        : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy          : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const IntegrationServers = new Mongo.Collection('integration_servers');
IntegrationServers.attachSchema(IntegrationServer);
// Don't track changes because the data changes too frequently (authData, isActive, isAuthenticated)
//ChangeTracker.trackChanges(IntegrationServers, 'IntegrationServers');

// These are server side only
IntegrationServers.deny({
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
IntegrationServers.helpers({
  // Common method for creating the contributor identifiers per server
  contributorIdentifier (key) {
    return this._id + '.' + key
  },
  
  /**
   * Get the list of mapped statuses for a phase and state combination
   * @param workPhaseKey
   * @param workStateKey
   * @return {[String]}
   */
  mappedPhaseStatuses (workPhaseKey, workStateKey) {
    let statusMap     = this.statusMap,
        phaseStatuses = [];
    
    if (_.isObject(statusMap)) {
      _.keys(statusMap).forEach((rawStatusId) => {
        if (statusMap[ rawStatusId ].workPhase === workPhaseKey && statusMap[ rawStatusId ].workState === workStateKey) {
          phaseStatuses.push(statusMap[ rawStatusId ])
        }
      })
    }
    
    //console.log('IntegrationServers.mappedPhaseStatuses:', statusMap, workPhaseKey, workStateKey);
    
    return phaseStatuses
  },
  /**
   * Get the auth provider config for this server
   */
  authProviderConfig () {
    return IntegrationServerAuthProviders.findOne({ serverId: this._id })
  }
});