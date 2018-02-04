import { Users } from './users/users.js';

/**
 * Global permissions helpers
 */
export const Auth = {
  /**
   * Global helper for methods to require authentication
   * @returns {user}
   */
  requireAuthentication () {
    let user = Users.findOne(Meteor.userId());
    if (user) {
      return user
    }
    throw new Meteor.Error('403');
  },
  
  /**
   * Deny any user without admin privileges
   * @param userId
   * @param doc
   * @returns {*|boolean}
   */
  denyIfNotAdmin (userId, doc) {
    let user = Users.findOne(userId);
    if (userId && user) {
      return !user.isAdmin();
    }
    return true;
  }
};
