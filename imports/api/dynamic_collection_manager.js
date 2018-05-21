import { Meteor }             from 'meteor/meteor';
import { Mongo }              from 'meteor/mongo';
import SimpleSchema           from 'simpl-schema';
import { SchemaHelpers }      from './schema_helpers';
import { DynamicCollections } from './dynamic_collections/dynamic_collections';
import { Auth }               from './auth';
import { Util }               from './util';

export const DynamicCollectionManager = {
  collections: {},
  schemas    : {},
  
  /**
   * Compile all of the dynamic collections and run all upgrade scripts
   */
  compileCollections () {
    console.info('DynamicCollectionManager.compileCollections');
    DynamicCollections.find({}).forEach((collection) => {
      try {
        // Compile
        DynamicCollectionManager.compileCollection(collection);
        
        // Run the transformations
        
      } catch (e) {
        console.error('DynamicCollectionManager.compileCollections failed to compile collection:', collection, e);
      }
    })
  },
  
  /**
   * Compile a single collection
   * @param collection
   */
  compileCollection (collection) {
    console.info('DynamicCollectionManager.compileCollection:', collection.title);
    
    // Compile the collection definition
    let code = '(function(){' + "\n" + (collection.preambleCode || '') + "\n" +
        'let collectionKey       = \'' + collection.title + '\',' + "\n" +
        '    mongoCollectionName = \'' + Util.camelToUnderscore(collection.title) + '\';' + "\n" +
        'try {' + "\n" +
        '  DynamicCollectionManager.collections[collectionKey] = new Mongo.Collection(mongoCollectionName);' + "\n" +
        '} catch(e) {' + "\n" +
        '  if(e.toString().match(/already a collection named/i)){' + "\n" +
        '    console.log("Collection", mongoCollectionName, "already exists")' + "\n" +
        '  } else {' + "\n" +
        '    throw e;' + "\n" +
        '  }' + "\n" +
        '}';
    
    if (collection.schemaCode) {
      code += 'DynamicCollectionManager.schemas[collectionKey] = new SimpleSchema(' + collection.schemaCode + ');' + "\n";
      code += 'DynamicCollectionManager.collections[collectionKey].attachSchema(DynamicCollectionManager.schemas[collectionKey]);' + "\n";
    }
    
    if (collection.helpersCode) {
      code += 'let check = require(\'meteor/check\').check;' + "\n";
      code += 'let Match = require(\'meteor/check\').Match;' + "\n";
      code += 'DynamicCollectionManager.collections[collectionKey].helpers(' + collection.helpersCode + ');' + "\n";
    }
    
    // If this is the server, compile the methods and publications
    if (Meteor.isServer) {
      if (collection.methodsCode) {
        code += "\n" + 'Meteor.methods(' + collection.methodsCode + ');' + "\n";
      }
      
      if (collection.publicationsCode) {
        code += "\n" + collection.publicationsCode + "\n";
      }
    }
    
    code += "\n" + '})()';
    
    //console.log('compileTemplate:', collection.title, code);
    try {
      eval(code);
    } catch (e) {
      console.error('compileTemplate failed:', collection.title, code, e);
      throw e
    }
    return code
  },
  
  /**
   * Retrieve a collection by name
   * @param collectionName
   */
  getCollection (collectionName) {
    return this.collections[ collectionName ]
  }
};