import { Mongo }         from 'meteor/mongo';
import { ImportedItems } from './imported_items';

const omitFields = [
  'document'
];

/**
 * Simplified copy of imported items
 */
export const ImportedItemCrumbs = new Mongo.Collection('imported_item_crumbs');

// These are server side only
ImportedItemCrumbs.deny({
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

// Track changes to the ImportedItems and maintain a crumb for each
ImportedItems.after.insert((userId, document) => {
  try {
    ImportedItemCrumbs.insert(_.omit(document, omitFields));
  } catch (e) {
    console.error('ImportedItemCrumbs.after.insert failed:', _.omit(document, omitFields), e);
  }
});
ImportedItems.after.update((userId, document, rawChangedFields) => {
  try {
    ImportedItemCrumbs.update({ _id: document._id }, { $set: _.omit(document, omitFields) });
  } catch (e) {
    console.error('ImportedItemCrumbs.after.update failed:', document._id, _.omit(document, omitFields), e);
  }
});
ImportedItems.after.remove((userId, document) => {
  try {
    ImportedItemCrumbs.remove({ _id: document._id });
  } catch (e) {
    console.error('ImportedItemCrumbs.after.remove failed:', document._id, e);
  }
});

/**
 * Helpers
 */
ImportedItemCrumbs.helpers({});