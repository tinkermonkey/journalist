import { Meteor }             from 'meteor/meteor';
import { check }              from 'meteor/check';
import { ImportedItems }      from '../imported_items';

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
    return []
  }
});

Meteor.publish('integration_imported_item_crumbs', function (integrationId) {
  console.log('Publish: integration_imported_item_crumbs', integrationId);
  if (this.userId && integrationId) {
    return ImportedItems.find({ integrationId: integrationId }, { fields: { document: false } });
  } else {
    this.ready();
    return []
  }
});

Meteor.publish('imported_item', function (itemId) {
  console.log(this._session && this._session.id || '-', this._session && this._session.userId, this.connection.clientAddress, 'Publish: imported_item', itemId);
  if (this.userId && itemId) {
    return ImportedItems.find({ _id: itemId })
  } else {
    this.ready();
    return []
  }
});

Meteor.publish('imported_item_query', function (query, options) {
  console.log('Publish: imported_item_query');
  if (this.userId && query && _.isObject(query)) {
    return ImportedItems.find(query, options);
  } else {
    this.ready();
    return []
  }
});

Meteor.publish('imported_item_crumb_query', function (query, options) {
  console.log('Publish: imported_item_crumb_query');
  if (this.userId && query && _.isObject(query)) {
    _.defaults(options || {}, {
      fields: { document: false }
    });
    return ImportedItems.find(query, options);
  } else {
    this.ready();
    return []
  }
});

Meteor.publish('team_imported_item_crumbs', function (teamId) {
  console.log('Publish: team_imported_item_crumbs', teamId);
  if (this.userId && teamId) {
    return ImportedItems.find({ teamId: teamId }, { fields: { document: false } });
  } else {
    this.ready();
    return []
  }
});

Meteor.publish('imported_item_query_count', function (query, queryId) {
  console.log('Publish: imported_item_query_count', queryId);
  
  if (!this.userId) {
    this.ready();
    return []
  }
  
  let self         = this,
      count        = 0,
      initializing = true,
      handle       = ImportedItems.find(query).observeChanges({
        added  : function (id) {
          count++;
          if (!initializing) {
            self.changed('imported_item_counts', queryId, { count: count });
          }
        },
        removed: function (id) {
          count--;
          self.changed('imported_item_counts', queryId, { count: count });
        }
      });
  
  initializing = false;
  self.added('imported_item_counts', queryId, { count: count });
  self.ready();
  
  self.onStop(function () {
    handle.stop();
  });
});