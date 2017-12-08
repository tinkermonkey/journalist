import { Meteor } from 'meteor/meteor';

// include the base layer functionality
import './register-api.js';
import './fixture.js';
import './change_tracker_config.js';

// configure
import '../accounts_config.js';
import '../later_config.js';
import '../synced_cron_config.js';

// Integration Service
import { IntegrationService } from '../../modules/integration_service/integration_service.js';

Meteor.startup(() => {
  IntegrationService.start();
});