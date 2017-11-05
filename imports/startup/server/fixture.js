import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { UserTypes } from '../../api/users/user_types.js';
import { Contributors } from '../../api/contributors/contributors.js';
import { ContributorRoleDefinitions } from '../../api/contributors/contributor_role_definitions.js';

/**
 * On startup, check to see if the fixture data should be loaded
 */
Meteor.startup(() => {
  if (Meteor.users.find().count() === 0) {
    console.info('=====================================');
    console.info('No users found, executing data fixture...');
    let adminId = Accounts.createUser({
      username: 'admin@demo.com',
      email   : 'admin@demo.com',
      password: 'Password1',
      profile : {
        name: 'Delete Me'
      }
    });
    
    console.info('Created admin account:', adminId);
    Meteor.users.update(adminId, {
      $set: {
        usertype: UserTypes.administrator,
      }
    });
    
    // Create a contributor record for this user
    let admin = Meteor.users.findOne(adminId);
    console.log('Inserting contributor record for user:', admin);
    Contributors.insert({
      identifier: admin.emails[ 0 ].address,
      email     : admin.emails[ 0 ].address,
      name      : admin.profile.name,
      userId    : adminId,
      usertype: UserTypes.administrator
    });
    
    // Create some role definitions
    [
      'Developer',
      'QA Engineer',
      'Dev Manager',
      'QA Manager',
      'Architect',
      'Dev Lead',
      'QA Lead',
      'Product Manager',
      'Visual Designer',
      'Tech Writer',
      'Project Owner'
    ].sort().forEach((title, order) => {
      ContributorRoleDefinitions.insert({
        title: title,
        order: order
      })
    });
    
    console.info('...Fixture complete');
    console.info('=====================================');
  }
});
