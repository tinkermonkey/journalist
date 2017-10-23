import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Meteor.startup(() => {
  /**
   * Disable client side account creation
   */
  Accounts.config({
    forbidClientAccountCreation: true
  });
});