import { Meteor }        from 'meteor/meteor';
import { Auth }          from '../../auth';
import { check }         from "meteor/check";
import { ImportedItems } from '../imported_items';

Meteor.methods({
  getImportedItemQueryResultCount(query){
    console.log('getImportedItemQueryResultCount:', query);
    let user = Auth.requireAuthentication();
  
    // Validate the data is complete
    check(query, Object);
  
    // Validate that the current user is an administrator
    if (user) {
      return ImportedItems.find(query).count()
    } else {
      console.error('Unauthenticated user tried to get imported item query count:', query);
      throw new Meteor.Error(403);
    }
  }
});
