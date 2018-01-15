import { Meteor } from 'meteor/meteor';
import { DisplayTemplates } from '../display_templates';
import { DisplayTemplateGroups } from '../display_template_groups';
import { PublishedDisplayTemplates } from '../published_display_templates';

Meteor.publish('display_templates', function () {
  console.info('Publish: display_templates');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return DisplayTemplates.find({});
    } else {
      console.warn('display_templates requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('display_template_groups', function () {
  console.info('Publish: display_template_groups');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return DisplayTemplateGroups.find({});
    } else {
      console.warn('display_template_groups requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('published_display_templates', function () {
  console.info('Publish: published_display_templates');
  if (this.userId) {
    return PublishedDisplayTemplates.find({});
  } else {
    this.ready();
    return [];
  }
});
