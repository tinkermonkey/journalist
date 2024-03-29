import { Meteor }                           from 'meteor/meteor';
import { moment }                           from 'meteor/momentjs:moment';
import numeral                              from 'numeral';
import { Picker }                           from 'meteor/meteorhacks:picker';
import { Backlogs }                         from '../../backlogs/backlogs';
import { BacklogItems }                     from '../../backlogs/backlog_items';
import { BacklogItemCategories }            from '../../backlogs/backlog_item_categories';
import { BacklogItemResourceRequirements }  from '../../backlogs/backlog_item_resource_requirements';
import { BacklogItemResourceAllocations }   from '../../backlogs/backlog_item_resource_allocations';
import { CapacityPlans }                    from '../../capacity_plans/capacity_plans';
import { CapacityPlanOptions }              from '../../capacity_plans/capacity_plan_options';
import { CapacityPlanReleases }             from '../../capacity_plans/capacity_plan_releases';
import { CapacityPlanSprintBlocks }         from '../../capacity_plans/capacity_plan_sprint_blocks';
import { CapacityPlanSprintLinks }          from '../../capacity_plans/capacity_plan_sprint_links';
import { CapacityPlanSprints }              from '../../capacity_plans/capacity_plan_sprints';
import { CapacityPlanStrategicEffortItems } from '../../capacity_plans/capacity_plan_strategic_effort_items';
import { CapacityPlanStrategicEfforts }     from '../../capacity_plans/capacity_plan_strategic_efforts';
import { Contributors }                     from '../../contributors/contributors';
import { ContributorProjectAssignments }    from '../../contributors/contributor_project_assignments';
import { ContributorRoleDefinitions }       from '../../contributors/contributor_role_definitions';
import { ContributorTeamRoles }             from '../../contributors/contributor_team_roles';
import { DisplayTemplates }                 from '../../display_templates/display_templates';
import { DisplayTemplateGroups }            from '../../display_templates/display_template_groups';
import { DynamicCollections }               from '../../dynamic_collections/dynamic_collections';
import { PublishedDisplayTemplates }        from '../../display_templates/published_display_templates';
import { Efforts }                          from '../../efforts/efforts';
import { IntegrationCalculatedFields }      from '../../integrations/integration_calculated_fields';
import { IntegrationImportFunctions }       from '../../integrations/integration_import_functions';
import { IntegrationServerAuthProviders }   from '../../integrations/integration_server_auth_providers';
import { IntegrationServerCaches }          from '../../integrations/integration_server_caches';
import { IntegrationServers }               from '../../integrations/integration_servers';
import { Integrations }                     from '../../integrations/integrations';
import { Priorities }                       from '../../priorities/priorities';
import { Projects }                         from '../../projects/projects';
import { Releases }                         from '../../releases/releases';
import { ReleaseIntegrationLinks }          from '../../releases/release_integration_links';
import { ScheduledJobs }                    from '../../scheduled_jobs/scheduled_jobs';
import { StatusReportSettings }             from '../../status_reports/status_report_settings';
import { StatusReports }                    from '../../status_reports/status_reports';
import { Subtasks }                         from '../../subtasks/subtasks';
import { Tasks }                            from '../../tasks/tasks';
//import { TaskStates }                       from '../../tasks/task_states';
import { Teams }                            from '../../teams/teams';
import { Users }                            from '../../users/users';

let AdmZip     = require('adm-zip'),
    fs         = require('fs'),
    path       = require('path'),
    os         = require('os'),
    importKeys = {
      DisplayTemplates         : 'templateName',
      PublishedDisplayTemplates: 'templateName'
    };

export const CollectionMap = {
  Backlogs                        : Backlogs,
  BacklogItems                    : BacklogItems,
  BacklogItemCategories           : BacklogItemCategories,
  BacklogItemResourceRequirements : BacklogItemResourceRequirements,
  BacklogItemResourceAllocations  : BacklogItemResourceAllocations,
  CapacityPlans                   : CapacityPlans,
  CapacityPlanReleases            : CapacityPlanReleases,
  CapacityPlanSprintBlocks        : CapacityPlanSprintBlocks,
  CapacityPlanSprintLinks         : CapacityPlanSprintLinks,
  CapacityPlanSprints             : CapacityPlanSprints,
  CapacityPlanStrategicEffortItems: CapacityPlanStrategicEffortItems,
  CapacityPlanStrategicEfforts    : CapacityPlanStrategicEfforts,
  CapacityPlanOptions             : CapacityPlanOptions,
  Contributors                    : Contributors,
  ContributorProjectAssignments   : ContributorProjectAssignments,
  ContributorRoleDefinitions      : ContributorRoleDefinitions,
  ContributorTeamRoles            : ContributorTeamRoles,
  DisplayTemplates                : DisplayTemplates,
  DisplayTemplateGroups           : DisplayTemplateGroups,
  DynamicCollections              : DynamicCollections,
  Efforts                         : Efforts,
  PublishedDisplayTemplates       : PublishedDisplayTemplates,
  IntegrationCalculatedFields     : IntegrationCalculatedFields,
  IntegrationImportFunctions      : IntegrationImportFunctions,
  IntegrationServerAuthProviders  : IntegrationServerAuthProviders,
  IntegrationServerCaches         : IntegrationServerCaches,
  IntegrationServers              : IntegrationServers,
  Integrations                    : Integrations,
  Projects                        : Projects,
  Priorities                      : Priorities,
  Releases                        : Releases,
  ReleaseIntegrationLinks         : ReleaseIntegrationLinks,
  ScheduledJobs                   : ScheduledJobs,
  StatusReportSettings            : StatusReportSettings,
  StatusReports                   : StatusReports,
  Subtasks                        : Subtasks,
  Tasks                           : Tasks,
  //TaskStates                      : TaskStates,
  Teams                           : Teams,
  Users                           : Users
};

/**
 * Setup the server side route for downloading the files
 */
Picker.route('/export/:fileName', function (params, req, res, next) {
  if (params && params.fileName && !(params.fileName.includes('..') && params.fileName.includes('/'))) {
    if (fs.existsSync(ImportExportTool.dataPath, params.fileName)) {
      let filePath = path.join(ImportExportTool.dataPath, params.fileName),
          name     = 'journalist_export_' + moment().format('YYYYMMDD_HHmmss') + '.zip';
      
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
  dataPath : os.tmpdir(),
  fileRegex: /journalist_export/i,
  encoding : 'utf8',
  
  /**
   * Import a paritcular collection
   * @param fileName      The name of the file being uploaded
   */
  importData (fileName) {
    let handler  = this,
        filePath = path.join(handler.dataPath, fileName),
        data, collectionName;
    
    console.info('ImportExportTool.importData importing file:', fileName);
    
    // unzip it if needed
    if (filePath.match(/\.zip$/)) {
      let zipFile     = new AdmZip(filePath),
          zipEntries  = zipFile.getEntries(),
          sortedNames = zipEntries.map((zipEntry) => {
            return zipEntry.entryName
          }).sort();
      
      //console.info('ImportExportTool.importData file list', sortedNames);
      
      if (sortedNames && sortedNames.length) {
        sortedNames.forEach((entryName) => {
          let zipEntry = zipFile.getEntry(entryName);
          if (zipEntry.entryName && zipEntry.entryName.match(/^[0-9]+.+\.json$/)) {
            //console.info('ImportExportTool.importData reading file ' + zipEntry.entryName);
            
            let input = zipFile.readAsText(zipEntry, handler.encoding);
            
            try {
              data           = JSON.parse(input);
              collectionName = zipEntry.entryName.replace(/\.json$/i, '').replace(/^[0-9]+_/i, '');
              
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
        collectionName = path.basename(filePath).replace(/\.json$/i, '').replace(/^[0-9]+_/i, '');
        
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
    if (data && collectionName && CollectionMap[ collectionName ]) {
      // if you have a partial duplicate, you should still be able to import the rest of the file.
      try {
        let key         = importKeys[ collectionName ] || '_id',
            query       = {},
            importCount = 0;
        data.forEach((record) => {
          query[ key ] = record[ key ];
          importCount += 1;
          //console.info('ImportExportTool.insertDataIntoCollection inserting', collectionName, key, record[ key ]);
          
          // Updating the _id field will fail, so remove it
          if (key !== '_id') {
            delete record._id
          }
          
          // Upsert triggers insert handler default values, so do an update or insert
          let check = CollectionMap[ collectionName ].findOne(query);
          if (check) {
            CollectionMap[ collectionName ].remove(query);
          }
          CollectionMap[ collectionName ].insert(record, { bypassCollection2: true });
        });
        console.info('ImportExportTool inserted', importCount, 'records into', collectionName);
      } catch (e) {
        console.error('ImportExportTool.insertDataIntoCollection failed:', e);
      }
    } else {
      console.error('ImportExportTool.insertDataIntoCollection failed: collection [', collectionName, '] not found');
    }
  },
  
  /**
   * Export a set of the Collections
   * @param collectionNames (optional) A list of collection names
   */
  exportData (collectionNames) {
    console.info('ImportExportTool.exportData:', collectionNames);
    let handler = this,
        dataDir = path.join(handler.dataPath, moment().format('YYYYMMDD_HHmmss'));
    
    collectionNames = _.isArray(collectionNames) ? collectionNames : _.keys(CollectionMap);
    
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
    collectionNames.forEach((collectionName, i) => {
      let cursor   = CollectionMap[ collectionName ].find({}),
          fileName = numeral(i).format('000') + '_' + collectionName + '.json';
      
      zipFile.addFile(fileName, new Buffer(handler.getPayload(cursor, collectionName), handler.encoding), collectionName, 644);
    });
    
    dataDir = dataDir + '.zip';
    
    console.info('ImportExportTool.exportData creating data directory: ' + dataDir);
    
    zipFile.writeZip(dataDir);
    
    // delete the file after a bit, the download should start automatically
    Meteor.setTimeout(function () {
      fs.unlinkSync(dataDir);
      console.info('ImportExportTool.exportData deleted ' + dataDir);
    }, 25000);
    
    console.info('ImportExportTool.exportData complete');
    
    return path.basename(dataDir);
  },
  
  /**
   * Export a single document
   * @param collectionName The name of the collection to export the document from
   * @param documentId The _id of the document to export
   */
  exportDocument (collectionName, documentId) {
    console.info('ImportExportTool.exportDocument:', collectionName, documentId);
    let handler = this,
        dataDir = path.join(handler.dataPath, moment().format('YYYYMMDD_HHmmss'));
    
    if (fs.existsSync(dataDir)) {
      console.info('ImportExportTool.exportDocument removing existing files');
      fs.readdirSync(dataDir).filter((filepath) => {
        return path.basename(filepath).match(handler.fileRegex) != null
      }).forEach((filepath) => {
        console.info('Removing file: ' + filepath);
        
        fs.unlinkSync(path.join(dataDir, filepath));
      });
    }
    
    let zipFile  = new AdmZip(),
        cursor   = CollectionMap[ collectionName ].find({ _id: documentId }),
        fileName = numeral(1).format('000') + '_' + collectionName + '.json';
    
    zipFile.addFile(fileName, new Buffer(handler.getPayload(cursor, collectionName), handler.encoding), collectionName, 644);
    
    dataDir = dataDir + '.zip';
    
    console.info('ImportExportTool.exportDocument creating data directory: ' + dataDir);
    
    zipFile.writeZip(dataDir);
    
    // delete the file after a bit, the download should start automatically
    Meteor.setTimeout(function () {
      fs.unlinkSync(dataDir);
      console.info('ImportExportTool.exportDocument deleted ' + dataDir);
    }, 25000);
    
    console.info('ImportExportTool.exportDocument complete');
    
    return path.basename(dataDir);
  },
  
  /**
   * Export a single collection
   * @param cursor         Collection cursor pointing to records to export
   * @param collectionName The name of the collection to tag the data with
   */
  getPayload (cursor, collectionName) {
    let handler     = this,
        output      = '',
        recordCount = cursor.count();
    
    console.info('ImportExportTool.getPayload exporting ' + collectionName + ' (' + recordCount + ' records)');
    // Originally this was being done manually record by record to allow for more readable files, but somehow the count-1 was not accurate
    // and this cause errors, so reverting to just stringifying the whole array for now.
    /*
    output += "[\n";
    cursor.forEach((record, i) => {
      output += JSON.stringify(record) + (i < recordCount - 1 ? ",\n" : "\n");
    });
    output += "]\n";
    */
    output = JSON.stringify(cursor.fetch());
    
    console.info('ImportExportTool.getPayload done Exporting ' + collectionName);
    
    return output;
  }
};