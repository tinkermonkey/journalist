import { Mongo }         from 'meteor/mongo';
import SimpleSchema      from 'simpl-schema';
import { Util }          from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * IntegrationServerRequest
 * ============================================================================
 */
export const IntegrationServerRequest = new SimpleSchema({
  method: {
    type: String
  },
  
});

export const IntegrationServerRequests = new Mongo.Collection("integration_server_requests");
IntegrationServerRequests.attachSchema(IntegrationServerRequest);

/**
 * Helpers
 */
IntegrationServerRequests.helpers({});