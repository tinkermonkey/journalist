import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ImportedItems } from '../imported_items';

Meteor.publish('integration_imported_items', function (integrationId, start, limit) {
  console.log('Publish: integration_imported_items', integrationId, start, limit);
  if (this.userId) {
    check(integrationId, String);
    start = start || 0;
    limit = limit || 100;
    return ImportedItems.find({ integrationId: integrationId }, {
      limit: limit,
      skip : start
    });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('integration_imported_item_count', function (integrationId) {
  console.log('Publish: integration_imported_item_count', integrationId);
  
  if (!this.userId) {
    this.ready();
    return [];
  }
  
  let self         = this,
      count        = 0,
      initializing = true,
      handle       = ImportedItems.find({ integrationId: integrationId }).observeChanges({
        added  : function (id) {
          count++;
          if (!initializing) {
            self.changed('counts', 'importedItemsCount', { count: count });
          }
        },
        removed: function (id) {
          count--;
          self.changed('counts', 'importedItemsCount', { count: count });
        }
      });
  
  initializing = false;
  self.added('counts', 'importedItemsCount', { count: count });
  self.ready();
  
  self.onStop(function () {
    handle.stop();
  });
});