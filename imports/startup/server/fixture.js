import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

/**
 * On startup, check to see if the fixture data should be loaded
 */
Meteor.startup(() => {
  if (Meteor.users.find().count() === 0) {
    console.info("=====================================");
    console.info("No users found, executing data fixture...");
    Accounts.createUser({
      username: 'Administrator',
      email   : 'admin@nothing.com',
      password: 'Password1',
      isAdmin: true,
      profile : {
        name: 'Administrator User'
      }
    });
    console.info("...Fixture complete");
    console.info("=====================================");
  }
});
