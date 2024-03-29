import SimpleSchema from 'simpl-schema';

// Base functionality
import './routes.js';
import './client.js';

// Default CSS
import '../../../client/ui/stylesheets/base.css';
import '../../../client/ui/stylesheets/data_table.css';
import '../../../client/ui/stylesheets/page_banner.css';
import '../../../client/ui/stylesheets/show_controls.css';
import '../../../client/ui/stylesheets/sidebar.css';
import '../../../client/ui/stylesheets/sortable_table.css';
import '../../../client/ui/stylesheets/status_reports.css';
import '../../../client/ui/stylesheets/team_roster_assignments.css';

// Supporting configuration
import '../accounts_config';
import '../later_config';
import '../moment_config';

Meteor.startup(() => {
  // Make sure simpleSchema is configured correctly
  SimpleSchema.extendOptions(['autoform', 'denyUpdate']);
});
