import { Meteor }                         from 'meteor/meteor';
import { UploadServer }                   from 'meteor/tomi:upload-server';
import { IntegrationServerAuthProviders } from '../../api/integrations/integration_server_auth_providers';
import { ServiceConfiguration }           from 'meteor/service-configuration';
// include the base layer functionality
import './register-api.js';
import './fixture.js';
import './change_tracker_config.js';
// configure
import '../accounts_config.js';
import '../later_config.js';
import '../synced_cron_config.js';
// Integration Service
import { IntegrationService }             from '../../modules/integration_service/integration_service.js';
import { HealthTracker }                  from '../../api/system_health_metrics/server/health_tracker';

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
  
  console.log('===========================');
});