import { Users } from './users/users.js';

/**
 * Global permissions helpers
 */
export const Auth = {
  /**
   * Global helper for methods to require authentication
   * @returns {user}
   */
  requireAuthentication() {
    let user = Users.findOne(Meteor.userId());
    if(user){
      return user
    }
    throw new Meteor.Error('403');
  }
};
