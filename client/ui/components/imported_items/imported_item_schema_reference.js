import './imported_item_schema_reference.html';
import { Template }     from 'meteor/templating';
import { ImportedItem } from '../../../../imports/api/imported_items/imported_items';

/**
 * Template Helpers
 */
Template.ImportedItemSchemaReference.helpers({
  importedItemFieldReference () {
    //console.log('ImportedItem:', ImportedItem);
    let itemSchema     = ImportedItem.schema(),
        fieldReference = [];
    _.keys(itemSchema).sort((keyA, keyB) => {
      let fieldA = itemSchema[ keyA ],
          fieldB = itemSchema[ keyB ];
      
      if (fieldA.optional === fieldB.optional) {
        return keyA.substr(0, 1).toLowerCase() > keyB.substr(0, 1).toLowerCase() ? 1 : -1
      } else if (fieldA.optional === true && fieldB.optional !== true) {
        return 1
      } else {
        return -1;
      }
    }).forEach((key) => {
      let field = itemSchema[ key ];
      
      //console.log('ImportedItem field:', key, field, field.type && field.type.name);
      // All of the user-facing fields have a descriptive label
      if (field.label && field.label.length) {
        
        field.key  = key;
        field.type = field.type && field.type.name;
        fieldReference.push(field);
      }
    });
    
    return fieldReference
  }
});

/**
 * Template Event Handlers
 */
Template.ImportedItemSchemaReference.events({});

/**
 * Template Created
 */
Template.ImportedItemSchemaReference.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.ImportedItemSchemaReference.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ImportedItemSchemaReference.onDestroyed(() => {
  
});
