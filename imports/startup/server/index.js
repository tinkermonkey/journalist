import { Meteor }                         from 'meteor/meteor';
import { ServiceConfiguration }           from 'meteor/service-configuration';
import { UploadServer }                   from 'meteor/tomi:upload-server';
import { SyncedCron }                     from 'meteor/percolate:synced-cron';
import { Clustering }                     from 'meteor/austinsand:journalist-clustering';
import { IntegrationServerAuthProviders } from '../../api/integrations/integration_server_auth_providers';
import { StatusReportSettings }           from '../../api/status_reports/status_report_settings';
//
// Logging
import { logger }                         from 'meteor/austinsand:journalist-logger';

logger.info('==============================================================================');
logger.info('Journalist Server Start');
logger.info('Cluster node:', Clustering.workerId());
logger.info('Cluster master:', Clustering.isMaster());
logger.info('==============================================================================');

//
// include the base layer functionality
import './register-api';
import './fixture';
import './change_tracker_config';
//
// configure
import '../accounts_config';
import '../later_config';
import '../moment_config';
import '../synced_cron_config';
//
// Upgrade
import './upgrade';
//
// Integration Service
import { IntegrationService }             from '../../modules/integration_service/integration_service';
import { HealthTracker }                  from '../../api/system_health_metrics/server/health_tracker';
import SimpleSchema                       from "simpl-schema";

let os = require('os');

Meteor.startup(() => {
  logger.info('Meteor.startup');
  
  if (Clustering.isMaster()) {
    SyncedCron.stop();
    SyncedCron.start();
    HealthTracker.init();
    IntegrationService.start();
  }
  
  // Initialize the upload server
  logger.info('Upload server upload directory:', os.tmpdir());
  UploadServer.init({
    tmpDir                : os.tmpdir(),
    uploadDir             : os.tmpdir(),
    checkCreateDirectories: true
  });
  
  // Initialize the authentication providers
  IntegrationServerAuthProviders.find({ isEnabled: true }).forEach((provider) => {
    try {
      let update = { $set: provider.compileAuthConfig() };
      logger.info('Initializing auth provider:', provider._id, provider.authServiceKey, provider.loginFunctionName);
      
      ServiceConfiguration.configurations.upsert({
        service: provider.authServiceKey
      }, update);
    } catch (e) {
      logger.error('Failed to initialize auth provider:', provider._id, provider.authServiceKey, provider.loginFunctionName, e);
    }
  });
  
  // Make sure simpleSchema is configured correctly
  SimpleSchema.extendOptions([ 'autoform', 'denyUpdate' ]);
  
  // Create a cron job to update the report next due dates nightly
  if (Clustering.isMaster()) {
    SyncedCron.remove('status-report-due-date-updater');
    SyncedCron.add({
      name: 'status-report-due-date-updater',
      schedule (parser) {
        let parserText = 'at 12:01 am';
        return parser.text(parserText);
      },
      job () {
        logger.info('==== Updating status report next due dates...');
        StatusReportSettings.find({}).forEach((setting) => {
          setting.updateNextDue();
        });
        logger.info('==== Update complete');
      }
    });
  }
  
  logger.info('==============================================================================');
});