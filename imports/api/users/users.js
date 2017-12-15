import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Contributors } from '../contributors/contributors';

/**
 * ============================================================================
 * Users
 * ============================================================================
 */
export const Users = Meteor.users;

/**
 * Helpers
 */
Users.helpers({
  /**
   * Does this user have a administrator role
   * @return {boolean}
   */
  isAdmin () {
    let contributor = this.contributor();
    if (contributor) {
      return contributor.isAdmin();
    }
  },
  /**
   * Does this user have a manager role
   * @return {boolean}
   */
  isManager () {
    let contributor = this.contributor();
    if (contributor) {
      return contributor.isManager();
    }
  },
  /**
   * Determine if this user manages a specific contributor
   * @param contributorId
   */
  managesContributor (contributorId) {
    return this.contributor().managesContributor(contributorId);
  },
  /**
   * Get the contributor record for this user
   */
  contributor () {
    let user        = this,
        contributor = Contributors.findOne({ userId: user._id });
    if (!contributor && Meteor.isServer && (Meteor.userId() === user._id || Meteor.user().isAdmin())) {
      //console.log('Users creating contributor:', user);
      // Create a contributor record if the circumstances are correct:
      // 1) A record doesn't exist
      // 2) This is running on the server
      // 3A) The current user is this user
      // OR
      // 3B) The current user is an administrator
      Contributors.insert({
        email     : user.emails[ 0 ].address,
        name      : user.profile.name,
        userId    : user._id,
        usertype  : user.usertype
      });
      
      // Grab the new record
      contributor = Contributors.findOne({ userId: user._id });
      //console.log('Users contributor created:', contributor);
    }
    return contributor
  }
});
