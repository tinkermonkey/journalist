import { Meteor }                        from 'meteor/meteor';
import { moment }                        from 'meteor/momentjs:moment';
import { Picker }                        from 'meteor/meteorhacks:picker';
import { Contributors }                  from '../../contributors/contributors';
import { ContributorProjectAssignments } from '../../contributors/contributor_project_assignments';
import { ContributorRoleDefinitions }    from '../../contributors/contributor_role_definitions';
import { ContributorTeamRoles }          from '../../contributors/contributor_team_roles';
import { IntegrationCalculatedFields }   from '../../integrations/integration_calculated_fields';
import { DisplayTemplates }              from '../../display_templates/display_templates';
import { DisplayTemplateGroups }         from '../../display_templates/display_template_groups';
import { PublishedDisplayTemplates }     from '../../display_templates/published_display_templates';
import { IntegrationImportFunctions }    from '../../integrations/integration_import_functions';
import { IntegrationServerCaches }       from '../../integrations/integration_server_caches';
import { IntegrationServers }            from '../../integrations/integration_servers';
import { Integrations }                  from '../../integrations/integrations';
import { Projects }                      from '../../projects/projects';
import { Teams }                         from '../../teams/teams';
import { Users }                         from '../../users/users';

let AdmZip        = require('adm-zip'),
    fs            = require('fs'),
    path          = require('path'),
    collectionMap = {
      Contributors                 : Contributors,
      ContributorProjectAssignments: ContributorProjectAssignments,
      ContributorRoleDefinitions   : ContributorRoleDefinitions,
      ContributorTeamRoles         : ContributorTeamRoles,
      DisplayTemplates             : DisplayTemplates,
      DisplayTemplateGroups        : DisplayTemplateGroups,
      PublishedDisplayTemplates    : PublishedDisplayTemplates,
      IntegrationCalculatedFields  : IntegrationCalculatedFields,
      IntegrationImportFunctions   : IntegrationImportFunctions,
      IntegrationServerCaches      : IntegrationServerCaches,
      IntegrationServers           : IntegrationServers,
      Integrations                 : Integrations,
      Projects                     : Projects,
      Teams                        : Teams,
      Users                        : Users
    },
    importKeys    = {
      DisplayTemplates         : 'templateName',
      PublishedDisplayTemplates: 'templateName'
    };

/**
 * Setup the server side route for downloading the files
 */
Picker.route('/export/:fileName', function (params, req, res, next) {
  if (params && params.fileName && !(params.fileName.includes('..') && params.fileName.includes('/'))) {
    if (fs.existsSync('/tmp/', params.fileName)) {
      let filePath = '/tmp/' + params.fileName,
          name     = 'export.zip';
      
      res.writeHead(200, {
        'Content-Type'       : 'application/zip',
        'Content-Disposition': 'attachment; filename=' + name
      });
      
      fs.createReadStream(filePath).pipe(res);
    } else {
      return 'Not Found';
    }
  }
});

export const ImportExportTool = {
  dataPath : '/tmp/',
  fileRegex: /\.json|\.json\.zip/,
  encoding : 'utf8',
  
  /**
   * Import a paritcular collection
   * @param fileName      The name of the file being uploaded
   */
  importData (fileName) {
    let handler  = this,
        filePath = path.join(handler.dataPath, fileName),
        data, collectionName;
    
    console.info('ImportExportTool.importData importing ' + fileName);
    
    // unzip it if needed
    if (filePath.match(/\.zip$/)) {
      let zipFile    = new AdmZip(filePath),
          zipEntries = zipFile.getEntries();
      
      if (zipEntries) {
        zipEntries.forEach((zipEntry) => {
          if (zipEntry.entryName && zipEntry.entryName.match(/\.json$/)) {
            console.info('ImportExportTool.importData reading file ' + zipEntry.entryName);
            
            let input = zipFile.readAsText(zipEntry, handler.encoding);
            
            try {
              data           = JSON.parse(input);
              collectionName = zipEntry.entryName.replace(/\.json$/i, '');
              
              handler.insertDataIntoCollection(data, collectionName);
            } catch (e) {
              console.error('ImportExportTool.importData JSON parse failed: ' + e.toString());
            }
          } else {
            console.error('Zip file did not contain any zip entries: ' + filePath);
          }
        });
      }
    } else {
      // read a raw json file
      try {
        let input      = fs.readFileSync(filePath, handler.encoding);
        data           = JSON.parse(input);
        collectionName = path.basename(filePath).replace(/\.json$/i, '');
        
        handler.insertDataIntoCollection(data, collectionName);
      } catch (e) {
        console.error('JSON file did not contain any entries: ' + filePath);
      }
    }
    
    fs.unlinkSync(filePath);
  },
  /**
   * Inserts the Data into your Collections.
   * @param data The contents of the file
   * @param collectionName The name of the collection we will insert
   */
  insertDataIntoCollection (data, collectionName) {
    if (data && collectionName && collectionMap[ collectionName ]) {
      // if you have a partial duplicate, you should still be able to import the rest of the file.
      try {
        let key   = importKeys[ collectionName ] || '_id',
            query = {};
        data.forEach((record) => {
          console.info('ImportExportTool.insertDataIntoCollection inserting ' + collectionName);
          query[ key ] = record[ key ];
          collectionMap[ collectionName ].upsert(query, { $set: record }, { validate: false });
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      console.error('ImportExportTool.insertDataIntoCollection failed: collection [' + collectionName + '] not found');
    }
  },
  /**
   * Export a set of the Collections
   * @param collectionNames (optional) A list of collection names
   */
  exportData (collectionNames) {
    console.info('ImportExportTool.exportData:', collectionNames);
    let handler = this,
        dataDir = path.join(handler.dataPath, moment().format('YYYY_MM_DD_HH_mm_ss'));
    
    collectionNames = _.isArray(collectionNames) ? collectionNames : _.keys(collectionMap);
    
    if (fs.existsSync(dataDir)) {
      console.info('ImportExportTool.exportData removing existing files');
      fs.readdirSync(dataDir).filter((filepath) => {
        return path.basename(filepath).match(handler.fileRegex) != null
      }).forEach((filepath) => {
        console.info('Removing file: ' + filepath);
        
        fs.unlinkSync(path.join(dataDir, filepath));
      });
    }
    
    let zipFile = new AdmZip();
    
    console.info('ImportExportTool.exportData exporting collections:', collectionNames);
    collectionNames.forEach((collectionName) => {
      let cursor = collectionMap[ collectionName ].find({});
      
      zipFile.addFile(collectionName + '.json', new Buffer(handler.getPayload(cursor, collectionName), handler.encoding), collectionName, 644);
    });
    
    dataDir = dataDir + '.zip';
    
    console.info('ImportExportTool.exportData creating data directory: ' + dataDir);
    
    zipFile.writeZip(dataDir);
    
    // delete the file after 5 minutes have passed
    Meteor.setTimeout(function () {
      fs.unlinkSync(dataDir);
      console.info('ImportExportTool.exportData deleted ' + dataDir);
    }, 30000);
    
    console.info('ImportExportTool.exportData complete');
    
    return path.basename(dataDir);
  },
  /**
   * Export a paritcular collection
   * @param cursor        Collection cursor poiting to records to export
   * @param collectionName The name of the collection to tag the data with
   */
  getPayload (cursor, collectionName) {
    let handler     = this,
        output      = '',
        recordCount = cursor.count();
    
    console.info('ImportExportTool.getPayload exporting ' + collectionName + ' (' + recordCount + ' records)');
    
    output += "[\n";
    cursor.forEach((record, i) => {
      output += JSON.stringify(record) + (i < recordCount - 1 ? ",\n" : "\n");
    });
    output += "]\n";
    
    console.info('ImportExportTool.getPayload done Exporting ' + collectionName);
    
    return output;
  }
};