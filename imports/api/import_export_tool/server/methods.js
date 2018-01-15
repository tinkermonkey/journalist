import { Meteor } from 'meteor/meteor';
import { ImportExportTool } from './import_export_tool.js';

Meteor.methods({
  exportData (collectionNames) {
    console.log('ImportExport.exportData:', collectionNames);
    return ImportExportTool.exportData(collectionNames);
  },
  importData (fileName) {
    console.log('ImportExport.importData:', fileName);
    ImportExportTool.importData(fileName);
  }
});