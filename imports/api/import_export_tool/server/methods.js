import { Meteor }           from 'meteor/meteor';
import { ImportExportTool } from './import_export_tool.js';

Meteor.methods({
  exportData (collectionNames) {
    console.log('ImportExport.exportData:', collectionNames);
    return ImportExportTool.exportData(collectionNames);
  },
  exportDocument (collectionName, documentId) {
    console.log('ImportExport.exportDocument:', collectionName, documentId);
    return ImportExportTool.exportDocument(collectionName, documentId);
  },
  importData (fileName) {
    console.log('ImportExport.importData:', fileName);
    ImportExportTool.importData(fileName);
  }
});