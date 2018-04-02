import { Mongo }         from 'meteor/mongo';
import SimpleSchema      from 'simpl-schema';
import { Util }          from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * ReleaseIntegrationLink
 * ============================================================================
 */
export const ReleaseIntegrationLink = new SimpleSchema({
  releaseId               : {
    type: String
  },
  serverId                : {
    type: String
  },
  projectId                : {
    type: String
  },
  integrationReleaseId    : {
    type: Array
  },
  'integrationReleaseId.$': {
    type: String
  }
});

export const ReleaseIntegrationLinks = new Mongo.Collection("release_integration_links");
ReleaseIntegrationLinks.attachSchema(ReleaseIntegrationLink);

/**
 * Helpers
 */
ReleaseIntegrationLinks.helpers({});