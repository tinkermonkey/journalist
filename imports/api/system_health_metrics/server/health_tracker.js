import { check } from 'meteor/check';
import { SystemHealthMetrics } from '../system_health_metrics';

let debug = false;

export const HealthTracker = {
  /**
   * Create a record for this key and title
   * @param key
   * @param title
   */
  init (key, title) {
    console.log('Initializing HealthTracker:', key, title);
    check(key, String);
    check(title, String);
    
    // Create or update the row
    SystemHealthMetrics.upsert({
      key: key
    }, {
      $set: {
        key  : key,
        title: title,
        isHealthy: false
      }
    });
  },
  update (key, isHealthy, detail) {
    debug && console.log('Updating HealthTracker:', key, isHealthy, detail);
    
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
  }
};