import { Meteor } from "meteor/meteor";
import { Contributors} from '../../contributors/contributors.js';

var AdmZip = require('adm-zip'),
    fs = require('fs'),
    path = require('path');

var collectionList = {

};

export const ImportExportTool = {
    dataPath: '/tmp/',
    fileRegex: /\.json|\.json\.zip/,
    encoding: 'utf8',

    /**
     * Import a paritcular collection
     * @param fileInfo      The filename
     * @param fileData      The contents of the file
     */
    importData(fileName) {
        var handler = this,
            filePath = path.join(handler.dataPath , fileName),
            data, collectionName;

        console.info("ImportExportDataHandler.importRecords importing "+fileName);

        // unzip it if needed
        if(filePath.match(/\.zip$/)) {
            var zipFile = new AdmZip(filePath);
            var zipEntries = zipFile.getEntries();
            
            if(zipEntries) {
                zipEntries.forEach((zipEntry) => {
                    if(zipEntry.entryName && zipEntry.entryName.match(/\.json$/)) {
                        console.info("ImportExportDataHandler.importRecords reading file "+zipEntry.entryName);

                        var input = zipFile.readAsText(zipEntry, handler.encoding);

                        try {
                            data = JSON.parse(input);
                            collectionName = zipEntry.entryName.replace(/\.json$/i, "");

                            handler.insertDataIntoCollection(data, collectionName);
                        } catch (e) {
                            console.error("ImportExportDataHandler.importRecords JSON parse failed: " + e.toString());
                        }
                    } else {
                        console.error("Zip file did not contain any zip entries: " + filePath);
                    }
                });
            }
        } else {
            // read a raw json file
            try {
                var input = fs.readFileSync(filePath, handler.encoding);
                data = JSON.parse(input);
                collectionName = path.basename(filePath).replace(/\.json$/i, "");

                handler.insertDataIntoCollection(data, collectionName);
            } catch (e) {
                console.error("JSON file did not contain any entries: " + filePath);
            }
        }

        fs.unlinkSync(filePath);
    },
    /**
     * Inserts the Data into your Collections.
     * @param data The contents of the file
     * @param data The name of the collection we will insert
    */
    insertDataIntoCollection(data, collectionName)
    {
        if(data && collectionName && collectionList[collectionName]) {
            // if you have a partial duplicate, you should still be able to import the rest of the file.
            try {
                data.forEach((record) => {
                    console.info("ImportExportDataHandler.insertDataIntoCollection inserting " + collectionName);

                    collectionList[collectionName].upsert({_id: record._id}, {$set: record}, {validate: false});
                });
            } catch(e) {
                console.error(e);
            }
        } else {
            console.error("ImportExportDataHandler.importRecords failed: collection [" + collectionName + "] not found");
        }
    },
    /**
     * Export all of the Collections
     */
    exportData() {
        var handler = this,
            dataDir = path.join(handler.dataPath, new Date().toString().split(' ').join('_'));

        if(fs.existsSync(dataDir)) {
            console.info("ImportExportDataHandler.exportData removing existing files");
            fs.readdirSync(dataDir).filter((filepath) => {
                return path.basename(filepath).match(handler.fileRegex) != null
            }).forEach((filepath) => {
                console.info("Removing file: "+filepath);

                fs.unlinkSync(path.join(dataDir, filepath));
            });
        }

        var zipFile = new AdmZip();

        _.keys(collectionList).forEach((collectionName) => {
            var cursor = collectionList[collectionName].find({});

            zipFile.addFile(collectionName+".json", new Buffer(handler.getPayload(cursor, collectionName), handler.encoding), collectionName, 644);
        });

        dataDir = dataDir+".zip";

        console.info("ImportExportDataHandler.exportData creating data directory: "+dataDir);

        zipFile.writeZip(dataDir);

        // delete the file after 5 minutes have passed
        Meteor.setTimeout(function() {
            fs.unlinkSync(dataDir);
            console.info("ImportExportDataHandler.exportData deleted "+dataDir);
        }, 30000);

        console.info("ImportExportDataHandler.exportData complete");

        return path.basename(dataDir);
    },
    /**
     * Export a paritcular collection
     * @param cursor        Collection cursor poiting to records to export
     * @param collectioName The name of the collection to tag the data with
     */
    getPayload(cursor, collectionName) {
        var handler = this,
            output = "",
            recordCount = cursor.count();

        console.info("ImportExportDataHandler.getPayload exporting "+collectionName+" ("+recordCount+" records)");

        output += "[\n";
        cursor.forEach((record, i) => {
            output += JSON.stringify(record) + (i < recordCount - 1 ? ",\n":"\n");
        });
        output += "]\n";

        console.info("ImportExportDataHandler.getPayload done Exporting "+collectionName);

        return output;
    }
}