import './admin_home.html';
import { Template } from 'meteor/templating';
import { Contributors } from '../../../../../imports/api/contributors/contributors';
import { ContributorRoleDefinitions } from '../../../../../imports/api/contributors/contributor_role_definitions';
import { IntegrationCalculatedFields } from '../../../../../imports/api/integrations/integration_calculated_fields';
import { DisplayTemplates } from '../../../../../imports/api/display_templates/display_templates';
import { IntegrationImportFunctions } from '../../../../../imports/api/integrations/integration_import_functions';
import { IntegrationServers } from '../../../../../imports/api/integrations/integration_servers';
import { Projects } from '../../../../../imports/api/projects/projects';
import { Teams } from '../../../../../imports/api/teams/teams';
import { Users } from '../../../../../imports/api/users/users';
import './admin_stats_imported_items';
import './admin_stats_contributors';

/**
 * Template Helpers
 */
Template.AdminHome.helpers({
  calculatedFieldCount () {
    return IntegrationCalculatedFields.find().count()
  },
  contributorCount () {
    return Contributors.find().count()
  },
  displayTemplateCount () {
    return DisplayTemplates.find().count()
  },
  importFunctionCount () {
    return IntegrationImportFunctions.find().count()
  },
  projectCount () {
    return Projects.find().count()
  },
  roleDefinitionCount () {
    return ContributorRoleDefinitions.find().count()
  },
  serverCount () {
    return IntegrationServers.find().count()
  },
  teamCount () {
    return Teams.find().count()
  },
  userCount () {
    return Users.find().count()
  }
});

/**
 * Template Event Handlers
 */
Template.AdminHome.events({});

/**
 * Template Created
 */
Template.AdminHome.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.AdminHome.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminHome.onDestroyed(() => {
  
});
