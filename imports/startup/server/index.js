import { Meteor }                         from 'meteor/meteor';
import { UploadServer }                   from 'meteor/tomi:upload-server';
import { IntegrationServerAuthProviders } from '../../api/integrations/integration_server_auth_providers';
import { ServiceConfiguration }           from 'meteor/service-configuration';
import { StatusReportSettings }           from '../../api/status_reports/status_report_settings';

// include the base layer functionality
import './register-api';
import './fixture';
import './change_tracker_config';

// configure
import '../accounts_config';
import '../later_config';
import '../moment_config';
import '../synced_cron_config';

// Integration Service
import { IntegrationService }             from '../../modules/integration_service/integration_service';
import { HealthTracker }                  from '../../api/system_health_metrics/server/health_tracker';
import SimpleSchema from "simpl-schema";

Meteor.startup(() => {
  console.log('===========================');
  console.log('Journalist Server Start');
  console.log('===========================');
  HealthTracker.init();
  IntegrationService.start();
  
  // Initialize the upload server
  UploadServer.init({
    tmpDir                : '/tmp/',
    uploadDir             : '/tmp/',
    checkCreateDirectories: true
  });
  
  // Initialize the authentication providers
  IntegrationServerAuthProviders.find({ isEnabled: true }).observe({
    added (provider) {
      console.log('IntegrationServerAuthProvider initializing new auth provider:', provider._id, provider.authServiceKey, provider.loginFunctionName);
      try {
        let update = { $set: provider.compileAuthConfig() };
        //console.log('IntegrationServerAuthProvider auth config:', provider._id, update);
        ServiceConfiguration.configurations.upsert({
          service: provider.authServiceKey
        }, update);
      } catch (e) {
        console.error('IntegrationServerAuthProvider failed to initialize provider:', provider._id, provider.authServiceKey, provider.loginFunctionName, e);
      }
    },
    changed (provider) {
      console.log('IntegrationServerAuthProvider updating auth provider:', provider._id, provider.authServiceKey, provider.loginFunctionName);
      try {
        let update = { $set: provider.compileAuthConfig() };
        //console.log('IntegrationServerAuthProvider auth config:', provider._id, update);
        ServiceConfiguration.configurations.upsert({
          service: provider.authServiceKey
        }, update);
      } catch (e) {
        console.error('IntegrationServerAuthProvider failed to initialize provider:', provider._id, provider.authServiceKey, provider.loginFunctionName, e);
      }
    },
    removed (provider) {
      console.log('IntegrationServerAuthProvider removing auth provider:', provider._id, provider.authServiceKey, provider.loginFunctionName);
      ServiceConfiguration.configurations.remove({
        service: provider.authServiceKey
      });
    }
  });

  // Make sure simpleSchema is configured correctly
  SimpleSchema.extendOptions(['autoform', 'denyUpdate']);

  // Create a cron job to update the report next due dates nightly
  SyncedCron.remove('status-report-due-date-updater');
  SyncedCron.add({
    name: 'status-report-due-date-updater',
    schedule (parser) {
      let parserText = 'every 5 minutes';
      return parser.text(parserText);
    },
    job () {
      console.log('==== Updating status report next due dates...');
      StatusReportSettings.find({}).forEach((setting) => {
        setting.updateNextDue();
      });
      console.log('==== Update complete');
    }
  });
  
  
  console.log('===========================');
});