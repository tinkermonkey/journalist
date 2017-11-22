import { Meteor } from 'meteor/meteor';
import { Integrations } from '../integrations';

Meteor.publish('integrations', function (projectId) {
  console.info('Publish: integrations', projectId);
  if (this.userId && projectId) {
    let user = Meteor.users.findOne(this.userId);
    if(user && user.isAdmin()){
      return Integrations.find({projectId: projectId});
    } else {
      console.warn('integrations requested by non-admin:', this.userId, user && user.username)
    }
  } else {
    this.ready();
    return [];
  }
});
