import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check } from 'meteor/check';
import { Auth } from '../../auth.js';

Meteor.methods({
  /**
   * Add a user
   * @param userData
   */
  addUser(userData){
    console.log('addUser:', userData && userData.email);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(userData, Object);
    check(userData.email, String);
    check(userData.password, String);
    check(userData.name, String);
    check(userData.usertype, Number);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      // Create the user
      let newUserId = Accounts.createUser({
        username: userData.email,
        email   : userData.email,
        password: userData.password,
        profile : {
          name: userData.name
        }
      });
      
      // Set the user type
      Meteor.users.update(newUserId, { $set: { usertype: userData.usertype } });
    } else {
      console.error('Non-admin user tried to add a user:', user, userData);
      throw new Meteor.Error(403);
    }
  },
  /**
   * Edit a user's details
   * @param userId
   * @param key
   * @param value
   */
  editUser(userId, key, value){
    console.log('editUser:', userId, key, value);
    let user = Auth.requireAuthentication();
    
    // Validate
    check(userId, String);
    check(key, String);
    check(value, String);
    
    // Validate that the key is one of the few editable fields
    if(_.contains(['username', 'email', 'name', 'usertype'], key)){
      // Authorize the edit
      if(user.isAdmin() || user._id === userId){
        let update = {};
        
        switch(key){
          case 'username':
            update.username = value;
            break;
          case 'email':
            update['emails.0.address'] = value;
            break;
          case 'name':
            update['profile.name'] = value;
            break;
          case 'usertype':
            // confirm Admin access to prevent user's changing their user type
            if(user.isAdmin()){
              update.usertype = parseInt(value);
            } else {
              console.error('editUser failed, unauthorized:', key, userId, user.username);
            }
            break;
        }
        
        console.log('editUser update:', userId, key, value, update);
        Meteor.users.update(userId, {$set: update});
      } else {
        console.error('editUser failed, unauthorized:', key, userId, user.username);
      }
    } else {
      console.error('editUser failed, invalid key:', key);
      throw new Meteor.Error(403);
    }
  },
  /**
   * Delete a user
   * @param userId
   */
  deleteUser(userId){
    console.log('deleteUser:', userId);
    let user = Auth.requireAuthentication();
  
    // Validate
    check(userId, String);
    
    // Authorize and protect against deleting yourself
    if(user.isAdmin() && userId !== user._id){
      Meteor.users.remove(userId);
    } else {
      console.error('deleteUser failed, unauthorized:', user.username, userId);
      throw new Meteor.Error(403);
    }
  }
});
