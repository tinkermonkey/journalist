import { Meteor } from 'meteor/meteor';
import { Mongo }  from 'meteor/mongo';
import { logger } from 'meteor/austinsand:journalist-logger';

const MemoryCookieStore = require('tough-cookie').MemoryCookieStore,
      Future            = require('fibers/future'),
      request           = require('request'),
      CookieStores      = new Mongo.Collection('cookie_stores'),
      debug             = false;

export class MongoCookieStore extends MemoryCookieStore {
  constructor (key) {
    logger.info('Creating new MongoCookieStore:', key);
    super(...arguments);
    
    // Must be sync to work with Meteor
    this.synchronous = true;
    
    // This is how different cookie stores are separated in Mongo
    this.key = key;
    
    // Make sure there's a row in the DB for this key
    CookieStores.upsert({ key: this.key }, { $set: { key: this.key, lastInstantiated: Date.now() } });
    
    // Bind the persist function to the Meteor environment so the data can be stored
    this.persistCookies = Meteor.bindEnvironment(function () {
      debug && logger.info('MongoCookieStore persistCookies:', this.key);
      let self = this;
      
      // If in the middle of a restore operation hold off
      if (!self.inRestore) {
        let cookieData = self.getAllCookiesSync().map((cookie) => {
          return {
            str : cookie.cookieString(),
            data: cookie.toJSON()
          }
        });
        
        CookieStores.update({ key: this.key }, { $set: { cookies: cookieData, lastUpdated: Date.now() } });
      }
    }.bind(this));
  }
  
  /**
   * Put a cookie in the jar
   * @param cookie
   * @param callback
   */
  putCookie (cookie, callback) {
    debug && logger.info('MongoCookieStore putCookie:', this.key, cookie);
    
    super.putCookie(cookie, () => {
    });
    
    this.persistCookies();
    
    callback && callback.call(null);
  }
  
  /**
   * Remove a cookie from the jar
   * @param domain
   * @param path
   * @param key
   * @param callback
   */
  removeCookie (domain, path, key, callback) {
    debug && logger.info('MongoCookieStore removeCookie:', this.key, domain, path, key);
    
    super.removeCookie(domain, path, key, () => {
    });
    
    this.persistCookies();
    
    callback && callback.call(null);
  }
  
  /**
   * Remove multiple cookies from the jar
   * @param domain
   * @param path
   * @param callback
   */
  removeCookies (domain, path, callback) {
    debug && logger.info('MongoCookieStore removeCookies:', this.key, domain, path);
    
    super.removeCookies(domain, path, () => {
    });
    
    this.persistCookies();
    
    callback && callback.call(null);
  }
  
  /**
   * Get all of the cookies in a synchronous manner
   */
  getAllCookiesSync () {
    debug && logger.info('MongoCookieStore getAllCookiesSync:', this.key);
    let self   = this,
        future = new Future();
    
    let result = self.getAllCookies((error, cookies) => {
      logger.error('getAllCookies callback:', cookies);
      future.return(cookies);
    });
    
    let cookies = future.wait();
    logger.error('getAllCookiesSync cookies:', cookies);
    
    return cookies || [];
  }
  
  /**
   * Restore any stored cookies from the datastore
   */
  restoreCookies () {
    debug && logger.info('MongoCookieStore restoreCookies:', this.key);
    let self       = this,
        storedData = CookieStores.findOne({ key: self.key });
    
    if (storedData && storedData.cookies && storedData.cookies.length) {
      debug && logger.info('MongoCookieStore restoreCookies loading data:', self.key, storedData);
      
      // Set the inRestore flag to prevent DB writes as we re-hydrate the cookies
      self.inRestore = true;
      
      storedData.cookies.forEach((cookieData) => {
        try {
          let cookie = request.cookie(cookieData.str);
          _.keys(cookieData.data).forEach((key) => {
            
            switch (key) {
              case 'creation':
              case 'lastAccessed':
                cookie[ key ] = new Date(cookieData.data[ key ]);
                break;
              default:
                cookie[ key ] = cookieData.data[ key ];
            }
          });
          
          self.putCookie(cookie, () => {
          });
        } catch (e) {
          logger.error('MongoCookieStore failed to restore cookie:', cookieData, e);
        }
      });
      
      // Clear the inRestore flag so further changes will be persisted
      self.inRestore = false;
    } else {
      debug && logger.info('MongoCookieStore restoreCookies didn`t find stored cookies:', self.key, storedData);
    }
  }
  
}
