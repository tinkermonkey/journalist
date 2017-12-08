import { Integrator } from './integrator';
import { IntegrationTypes } from '../integration_types';

/**
 * Integrator for pulling in confluence pages
 */
export class ConfluenceIntegrator extends Integrator {
  constructor () {
    super(...arguments);
    this.type = IntegrationTypes.confluence;
    return this;
  }
}