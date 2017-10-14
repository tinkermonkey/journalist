import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Util } from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * Contributors
 * ============================================================================
 */
export const Contributor = new SimpleSchema({
  // Primary identifier for this contributor
  identifier: {
    type: String
  },
  email: {
    type: String
  },
  name: {
    type: String
  },
  // _id of the Contributor who manages this contributor
  manager: {
    type: String
  }
});

export const Contributors = new Mongo.Collection("contributors");
Contributors.attachSchema(Contributor);

/**
 * Helpers
 */
Contributors.helpers({});