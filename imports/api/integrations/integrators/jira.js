import { Integrator } from './integrator';
import { IntegrationTypes } from '../integration_types';

/**
 * Integrator for pulling in JIRA issues
 */
export class Jira extends Integrator {
  constructor () {
    super(...arguments);
    this.type = IntegrationTypes.jira;
    return this;
  }
}