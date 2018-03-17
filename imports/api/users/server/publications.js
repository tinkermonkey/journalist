import { Meteor }    from 'meteor/meteor';
import { logger }    from 'meteor/austinsand:journalist-logger';
import { UserTypes } from '../user_types.js';

Meteor.publish('user_level', function () {
  logger.info('Publish: user_level');
  if (this.userId) {
    return Meteor.users.find(this.userId, { fields: { usertype: 1 } })
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('admin_user_list', function () {
  logger.info('Publish: admin_user_list');
  if (this.userId) {
    // Verify the user has permission to access this
    let user = Meteor.users.findOne(this.userId);
    if (user && user.usertype === UserTypes.administrator) {
      return Meteor.users.find({}, { fields: { username: 1, emails: 1, usertype: 1, profile: 1 } });
    } else {
      logger.warn('admin_user_list requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});