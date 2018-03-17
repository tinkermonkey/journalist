import { Meteor }                    from 'meteor/meteor';
import { logger }                    from 'meteor/austinsand:journalist-logger';
import { DisplayTemplates }          from '../display_templates';
import { DisplayTemplateGroups }     from '../display_template_groups';
import { PublishedDisplayTemplates } from '../published_display_templates';

Meteor.publish('display_templates', function () {
  logger.info('Publish: display_templates');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return DisplayTemplates.find({});
    } else {
      logger.warn('display_templates requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('display_template_groups', function () {
  logger.info('Publish: display_template_groups');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if (user && user.isAdmin()) {
      return DisplayTemplateGroups.find({});
    } else {
      logger.warn('display_template_groups requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('published_display_templates', function () {
  logger.info('Publish: published_display_templates');
  if (this.userId) {
    return PublishedDisplayTemplates.find({});
  } else {
    this.ready();
    return [];
  }
});
