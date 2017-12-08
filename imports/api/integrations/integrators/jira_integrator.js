import { Integrator } from './integrator';
import { IntegrationTypes } from '../integration_types';

// Pull in the jira connector
let JiraConnector = require('jira-connector');

/**
 * Integrator for pulling in JIRA issues
 */
export class JiraIntegrator extends Integrator {
  constructor () {
    super(...arguments);
    this.type = IntegrationTypes.jira;
    return this;
  }
}