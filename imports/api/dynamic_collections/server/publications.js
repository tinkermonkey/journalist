import { Meteor }             from 'meteor/meteor';
import { DynamicCollections } from '../dynamic_collections';

Meteor.publish('basic_dynamic_collections', function () {
  console.log('Publish: basic_dynamic_collections');
  if (this.userId) {
    return DynamicCollections.find({});
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('dynamic_collections', function () {
  console.log('Publish: dynamic_collections');
  if (this.userId) {
    return DynamicCollections.find({});
  } else {
    this.ready();
    return [];
  }
});
