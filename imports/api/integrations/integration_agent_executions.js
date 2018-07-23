import { Mongo }         from 'meteor/mongo';
import SimpleSchema      from 'simpl-schema';
import { Util }          from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';

/**
 * ============================================================================
 * IntegrationAgentExecution
 * ============================================================================
 */
export const IntegrationAgentExecution = new SimpleSchema({
  integrationId  : {
    type : String,
    index: 1
  },
  serverId       : {
    type : String,
    index: 1
  },
  request        : {
    type    : Object,
    blackbox: true
  },
  responseTime   : {
    type    : SimpleSchema.Integer,
    optional: true
  },
  persistenceTime: {
    type    : SimpleSchema.Integer,
    optional: true
  },
  result         : {
    type    : Object,
    blackbox: true,
    optional: true
  },
  requestTime    : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated,
    index    : 1
  },
});

export const IntegrationAgentExecutions = new Mongo.Collection("integration_agent_executions");
IntegrationAgentExecutions.attachSchema(IntegrationAgentExecution);

/**
 * Helpers
 */
IntegrationAgentExecutions.helpers({});