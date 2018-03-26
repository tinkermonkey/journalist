import { Meteor }                  from 'meteor/meteor';
import { Releases }                from '../releases';
import { ReleaseIntegrationLinks } from '../release_integration_links';

Meteor.publish('releases', function () {
  console.log('Publish: releases');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return Releases.find({});
    } else {
      return Releases.find({}, { fields: { internalReleaseDate: false } });
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('release_integration_links', function () {
  console.log('Publish: release_integration_links');
  if (this.userId) {
    return ReleaseIntegrationLinks.find({});
  } else {
    this.ready();
    return [];
  }
});
