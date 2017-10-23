import { Meteor } from 'meteor/meteor';
import { Integrations } from '../integrations';

Meteor.publish('integrations', function () {
  console.info('Publish: integrations');
  if (this.userId) {
    let user = Meteor.users.findOne(this.userId);
    if(user && user.isAdmin()){
      return Integrations.find({});
    } else {
      console.warn('integrations requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});
