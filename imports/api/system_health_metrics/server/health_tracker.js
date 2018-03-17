import { check }               from 'meteor/check';
import { logger }              from 'meteor/austinsand:journalist-logger';
import { SystemHealthMetrics } from '../system_health_metrics';

let debug = false;

export const HealthTracker = {
  /**
   * Clear out all existing health metrics
   */
  init () {
    logger.info('HealthTracker.init');
    SystemHealthMetrics.remove({});
  },
  
  /**
   * Create a record for this key and title
   * @param key
   * @param title
   */
  add (key, title, type) {
    logger.info('Adding HealthTracker:', key, title, type);
    check(key, String);
    check(title, String);
    
    // Create or update the row
    SystemHealthMetrics.upsert({
      key: key
    }, {
      $set: {
        key      : key,
        title    : title,
        type     : type,
        isHealthy: false
      }
    });
  },
  
  /**
   * Update the health of a system
   * @param {*} key
   * @param {*} isHealthy
   * @param {*} detail
   */
  update (key, isHealthy, detail) {
    debug && logger.info('Updating HealthTracker:', key, isHealthy, detail);
    
    // Update the row
    SystemHealthMetrics.update({
      key: key
    }, {
      $set: {
        key      : key,
        isHealthy: isHealthy,
        detail   : detail,
      }
    });
  },
  
  /**
   * Remove a health metrics row
   * @param {*} key
   */
  remove (key) {
    SystemHealthMetrics.remove({
      key: key
    });
  }
};