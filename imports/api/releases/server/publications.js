import { Meteor }                  from 'meteor/meteor';
import { Releases }                from '../releases';
import { ReleaseIntegrationLinks } from '../release_integration_links';

Meteor.publish('releases', function () {
  console.log('Publish: releases');
  if (this.userId) {
    return Releases.find({});
  } else {
    return Releases.find({}, { fields: { devCompleteDate: false } });
  }
});

Meteor.publish('release_integration_links', function () {
  console.log('Publish: release_integration_links');
  return ReleaseIntegrationLinks.find({});
});
