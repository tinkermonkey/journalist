import { Meteor }        from 'meteor/meteor';
import { ChangeTracker } from 'meteor/austinsand:roba-change-tracker';

Meteor.startup(() => {
  ChangeTracker.setDebug(false);
  ChangeTracker.setIgnoredFieldList([
    'createdBy',
    'dateCreated',
    'modifiedBy',
    'dateModified'
  ]);
});