import { Mongo }         from 'meteor/mongo';
import SimpleSchema      from 'simpl-schema';

/**
 * ============================================================================
 * BacklogItemCategories
 * ============================================================================
 */
export const BacklogItemCategory = new SimpleSchema({
  title: {
    type: String
  },
  color: {
    type: String,
    defaultValue: '#298cff'
  }
});

export const BacklogItemCategories = new Mongo.Collection("backlog_item_categories");
BacklogItemCategories.attachSchema(BacklogItemCategory);

// These are server side only
BacklogItemCategories.deny({
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
BacklogItemCategories.helpers({});