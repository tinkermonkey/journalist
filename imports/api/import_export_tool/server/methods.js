import { Meteor } from 'meteor/meteor';
import { ImportExportTool } from './import_export_tool.js';

Meteor.methods({
  exportData () {
    return ImportExportTool.exportData();
  },
  importData (fileName) {
    ImportExportTool.importData(fileName);
  }
});