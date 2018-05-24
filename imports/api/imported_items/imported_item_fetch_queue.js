import { Mongo }    from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

/**
 * ============================================================================
 * ImportedItemFetchQueue
 * ============================================================================
 */
export const ImportedItemFetchQueueItem = new SimpleSchema({
  serverId                 : {
    type: String
  },
  identifier               : {
    type: String
  },
  integrationsChecked      : {
    type    : Array,
    optional: true
  },
  'integrationsChecked.$': {
    type: String
  },
  exhausted                : {
    type        : Boolean,
    defaultValue: false
  }
});

export const ImportedItemFetchQueue = new Mongo.Collection("imported_item_fetch_queue");
ImportedItemFetchQueue.attachSchema(ImportedItemFetchQueueItem);

/**
 * Helpers
 */
ImportedItemFetchQueue.helpers({});