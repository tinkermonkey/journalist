import './admin_home.html';
import { Template }                    from 'meteor/templating';
import { CapacityPlans }               from '../../../../../imports/api/capacity_plans/capacity_plans';
import { Contributors }                from '../../../../../imports/api/contributors/contributors';
import { ContributorRoleDefinitions }  from '../../../../../imports/api/contributors/contributor_role_definitions';
import { DisplayTemplates }            from '../../../../../imports/api/display_templates/display_templates';
import { DynamicCollections }          from '../../../../../imports/api/dynamic_collections/dynamic_collections';
import { IntegrationCalculatedFields } from '../../../../../imports/api/integrations/integration_calculated_fields';
import { IntegrationImportFunctions }  from '../../../../../imports/api/integrations/integration_import_functions';
import { Integrations }                from '../../../../../imports/api/integrations/integrations';
import { IntegrationServers }          from '../../../../../imports/api/integrations/integration_servers';
import { Projects }                    from '../../../../../imports/api/projects/projects';
import { Releases }                    from '../../../../../imports/api/releases/releases';
import { ScheduledJobs }               from '../../../../../imports/api/scheduled_jobs/scheduled_jobs';
import { StaticAssets }                from '../../../../../imports/api/static_assets/static_assets';
import { Teams }                       from '../../../../../imports/api/teams/teams';
import { Users }                       from '../../../../../imports/api/users/users';
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
  capacityPlanCount () {
    return CapacityPlans.find().count()
  },
  displayTemplateCount () {
    return DisplayTemplates.find().count()
  },
  dynamicCollectionCount () {
    return DynamicCollections.find().count()
  },
  integrationsCount () {
    return Integrations.find().count()
  },
  importFunctionCount () {
    return IntegrationImportFunctions.find().count()
  },
  projectCount () {
    return Projects.find().count()
  },
  releaseCount () {
    return Releases.find().count()
  },
  roleDefinitionCount () {
    return ContributorRoleDefinitions.find().count()
  },
  scheduledJobCount () {
    return ScheduledJobs.find().count()
  },
  serverCount () {
    return IntegrationServers.find().count()
  },
  staticAssetCount () {
    return StaticAssets.find().count()
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
