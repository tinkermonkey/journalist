import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { UserTypes } from './user_types';
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
  isAdmin(){
    return this.usertype === UserTypes.administrator
  },
  isManager(){
    return this.usertype === UserTypes.administrator || this.usertype === UserTypes.manager
  },
  directReports(){
    let user = this;
    if(user.isManager()){
      return Contributors.find({manager: user._id});
    }
  }
});