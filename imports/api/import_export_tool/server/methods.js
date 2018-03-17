import { Meteor }           from 'meteor/meteor';
import { logger }           from 'meteor/austinsand:journalist-logger';
import { ImportExportTool } from './import_export_tool.js';

Meteor.methods({
  exportData (collectionNames) {
    logger.info('ImportExport.exportData:', collectionNames);
    return ImportExportTool.exportData(collectionNames);
  },
  importData (fileName) {
    logger.info('ImportExport.importData:', fileName);
    ImportExportTool.importData(fileName);
  }
});