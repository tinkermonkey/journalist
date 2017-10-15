import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { UserTypes } from '../../api/users/user_types.js';

/**
 * On startup, check to see if the fixture data should be loaded
 */
Meteor.startup(() => {
  if (Meteor.users.find().count() === 0) {
    console.info("=====================================");
    console.info("No users found, executing data fixture...");
    let adminId = Accounts.createUser({
      username: 'admin@demo.com',
      email   : 'admin@demo.com',
      password: 'Password1',
      profile : {
        name: 'Delete Me'
      }
    });
    console.info("Created admin account:", adminId);
    Meteor.users.update(adminId, {
      $set: {
        usertype: UserTypes.administrator,
      }
    });
    
    console.info("...Fixture complete");
    console.info("=====================================");
  }
});
