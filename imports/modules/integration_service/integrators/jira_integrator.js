import { Integrator } from './integrator';
import { IntegrationTypes } from '../../../api/integrations/integration_types';
import { Meteor } from "meteor/meteor";
import { MongoCookieStore } from './mongo_cookie_store';
import { Util } from '../../../api/util';
import { ImportedItemWorkPhases } from '../../../api/imported_items/imported_item_work_phases';
import { ImportedItemWorkStates } from '../../../api/imported_items/imported_item_work_states';

// Pull in the jira connector
const JiraConnector    = require('jira-connector'),
      request          = require('request'),
      debug            = true,
      trace            = false,
      queryDefinitions = {
        master: "Master Select Query"
      },
      mapIgnoreModules = [
        'promise',
        'requestLib',
        'basic_auth',
        'cookie_jar'
      ],
      defaultExpand    = [
        'attachment',
        'changelog',
        'comments',
        'worklog'
      ];

// Ignore self-signed errors
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/**
 * Integrator for pulling in Jira issues
 */
export class JiraIntegrator extends Integrator {
  constructor () {
    console.log('Creating new JiraIntegrator');
    super(...arguments);
    this.type = IntegrationTypes.jira;
    
    // Create a cookie jar and load any stored data from Mongo
    this.cookieStore = new MongoCookieStore(this.provider.trackerKey);
    this.cookieStore.restoreCookies();
    this.cookieJar = request.jar(this.cookieStore);
    
    return this;
  }
  
  /**
   * Return this class' query definition set
   */
  static queryDefinitions () {
    return queryDefinitions
  }
  
  /**
   * Fetch the map of integration calls that can be made for this integration
   */
  integrationCallMap () {
    debug && console.log('JiraIntegrator.integrationCallMap:', this.provider.server.title);
    let self = this;
    
    if (self.client) {
      return _.keys(self.client)
          .filter((moduleKey) => {
            return !_.contains(mapIgnoreModules, moduleKey)
          })
          .map((moduleKey) => {
            if (_.isObject(self.client[ moduleKey ])) {
              return {
                name   : moduleKey,
                methods: _.keys(self.client[ moduleKey ]).filter((methodKey) => {
                  return _.isFunction(self.client[ moduleKey ][ methodKey ])
                }).sort()
              }
            }
          }).filter((module) => {
            return module && module.methods && module.methods.length > 0
          })
          .sort();
    }
  }
  
  /**
   * Retrieve a normalized list of statuses from the cache for this server
   */
  getCachedStatusList () {
    debug && console.log('JiraIntegrator.getCachedStatusList:', this.provider.server.title);
    let self        = this,
        statusCache = self.provider.getCachedData('statusList');
    
    if (statusCache && statusCache.length) {
      return statusCache.map((status) => {
        return { id: status.id, title: status.name, description: status.description, rawData: status }
      })
    }
  }
  
  /**
   * Authenticate this integrator
   * @param username
   * @param password
   */
  authenticate (username, password) {
    debug && console.log('JiraIntegrator.authenticate:', this.provider.server.title);
    let self = this;
    
    // Create the Jira client
    self.client = new JiraConnector({
      host      : self.provider.url.hostname,
      basic_auth: {
        username: username,
        password: password
      },
      cookie_jar: self.cookieJar
    });
    
    // Test it out
    let authResult = self.checkAuthentication();
    
    // If we're authenticated
    if (authResult.success) {
      // Store the auth data for re-use
      let base64auth = Buffer.from(username + ':' + password).toString('base64');
      self.provider.storeAuthData({ base64: base64auth })
    } else {
      // Make sure the server is marked unathenticated
      self.provider.clearAuthData();
    }
    
    return authResult;
  }
  
  /**
   * Authenticate this integrator using stored auth data
   * @param authData
   */
  reAuthenticate (authData) {
    console.log('JiraIntegrator.reAuthenticate:', this.provider.server.title);
    let self           = this,
        connectionInfo = {
          host      : self.provider.url.hostname,
          cookie_jar: self.cookieJar
        };
    
    // if there's stored base64 auth data
    if (authData && authData.base64) {
      connectionInfo.basic_auth = {
        base64: authData.base64
      }
    }
    
    // Create the Jira client
    self.client = new JiraConnector(connectionInfo);
    
    // Test it out
    let authResult = self.checkAuthentication();
    
    if (!authResult.success) {
      // Make sure the server is marked unathenticated
      self.provider.clearAuthData();
    }
    
    return authResult;
  }
  
  /**
   * Verify that the client is still authenticated
   */
  checkAuthentication () {
    debug && console.log('JiraIntegrator.checkAuthentication:', this.provider.server.title);
    let self = this;
    
    return self.fetchData('myself', 'getMyself');
  }
  
  /**
   * Update all of the cached data for this server
   */
  updateCachedData () {
    debug && console.log('JiraIntegrator.updateCachedData:', this.provider.server.title);
    let self = this;
    
    // If connected, otherwise the cached values would be wiped
    if (self.client) {
      // Cache the list of projects
      self.provider.storeCachedItem('projectList', self.fetchData('project', 'getAllProjects').response);
      
      // Cache the list of statuses
      self.provider.storeCachedItem('statusList', self.fetchData('status', 'getAllStatuses').response);
      
      // Cache the list of resolutions
      self.provider.storeCachedItem('resolutionList', self.fetchData('resolution', 'getAllResolutions').response);
      
      // Cache the list of issue types
      self.provider.storeCachedItem('issueTypeList', self.fetchData('issueType', 'getAllIssueTypes').response);
      
      // Cache the list of agile boards
      let boardList = self.fetchData('board', 'getAllBoards').response,
          sprints   = {};
      if (boardList && boardList.values) {
        self.provider.storeCachedItem('boardList', boardList.values);
        
        // Get the sprints
        boardList.values.forEach((board) => {
          let sprintResult = self.fetchData('board', 'getSprintsForBoard', { boardId: board.id }).response;
          if (sprintResult && sprintResult.values) {
            sprintResult.values.forEach((sprint) => {
              if (sprints[ sprint.id ]) {
                sprints[ sprint.id ].boards.push(board.id);
              } else {
                sprint.boards        = [ board.id ];
                sprints[ sprint.id ] = sprint;
              }
            });
          }
        });
      }
      self.provider.storeCachedItem('sprintList', _.values(sprints));
      
      // Cache the list of fields and create synthetic keys based on the field name for custom fields
      let fields = self.fetchData('field', 'getAllFields').response;
      fields.forEach((field) => {
        if (field.custom) {
          let syntheticKey = Util.wordsToCamel(field.name);
          
          // Make sure it's unique
          let dupes = fields.filter((checkField) => {
            return checkField.id === syntheticKey || checkField.syntheticKey === syntheticKey
          });
          if (dupes.length) {
            syntheticKey = syntheticKey + "_" + field.schema.customId
          }
          
          field.syntheticKey = syntheticKey.toLowerCase();
        }
      });
      self.provider.storeCachedItem('fieldList', fields);
    } else {
      console.warn('JiraIntegrator.updateCachedData: ignoring request, server not connected');
    }
  }
  
  /**
   * Fetch an item from the integration server
   * @param identifier
   */
  fetchItem (identifier) {
    debug && console.log('JiraIntegrator.fetchItem:', this.provider.server.title, identifier);
    let self = this;
    
    return self.fetchData('issue', 'getIssue', { issueKey: identifier, expand: defaultExpand }).response;
  }
  
  /**
   * Test out an import function
   * @param importFunction
   * @param identifier
   */
  testImportFunction (importFunction, identifier) {
    debug && console.log('JiraIntegrator.testImportFunction:', this.provider.server.title);
    let self              = this,
        rawItem           = self.fetchItem(identifier).response,
        postProcessedItem = self.postProcessItem(rawItem);
    
    return {
      rawItem      : rawItem,
      postProcessed: postProcessedItem,
      importResult : self.provider.importItem(importFunction, postProcessedItem)
    }
  }
  
  /**
   * Test out an integration pipeline
   * @param integration
   * @param details
   */
  testIntegration (integration, details) {
    debug && console.log('JiraIntegrator.testIntegration:', this.provider.server.title, integration._id);
    let self      = this,
        query     = integration.details[ details.queryKey ],
        rawResult = self.executeQuery(query, 0, details.limit || 5);
    
    if (rawResult.success === true) {
      try {
        let postProcessedItems = rawResult.response.issues.map((rawItem) => {
          return self.provider.postProcessItem(rawItem)
        });
        return {
          success       : true,
          rawResult     : rawResult,
          processedItems: postProcessedItems,
          importResult  : self.provider.importItems(integration.importFunction(), postProcessedItems)
        }
      } catch (e) {
        return {
          success: false,
          error  : e.toString()
        }
      }
    } else {
      return rawResult
    }
  }
  
  /**
   * Take in a query and append the criteria to limit the results to items with updates newer that the limitDate
   * @param query
   * @param limitDate
   */
  appendUpdateLimitToQuery (query, limitDate) {
    return query + ' AND updated > "' + moment(limitDate).format('YYYY/MM/DD HH:mm') + '"'
  }
  
  /**
   * Execute a query and return the raw results, following the paging in order to fetch the full results set
   * @param jql
   * @param startAt
   * @param maxResults
   * @param fields
   * @param expand
   */
  executeQuery (jql, startAt, maxResults, fields, expand) {
    debug && console.log('JiraIntegrator.executeQuery:', this.provider.server.title, jql, startAt);
    let self             = this,
        result           = self.fetchData('search', 'search', {
          jql       : jql,
          startAt   : startAt || 0,
          maxResults: maxResults,
          fields    : fields,
          expand    : expand || defaultExpand
        }),
        cumulativeIssues = [];
    
    // Check to see if everything was returned in the initial request
    if (result.success === true && result.response) {
      if ((maxResults && result.response.maxResults >= maxResults) || (result.response.maxResults >= result.response.total)) {
        return result
      } else {
        debug && console.log('JiraIntegrator.executeQuery paging further results:', result.response.maxResults, 'of', result.response.total, 'loaded');
        
        // Stash the results from the initial request
        cumulativeIssues = cumulativeIssues.concat(result.response.issues);
        
        // If not, page through the results (if needed) to get the full set
        let pageSize  = result.response.maxResults,
            pageCount = Math.ceil(result.response.total / pageSize),
            i;
        for (i = 2; i <= pageCount; i++) {
          debug && console.log('JiraIntegrator.executeQuery loading page:', i, 'of', pageCount, ', ', cumulativeIssues.length, 'issues loaded');
          result = self.fetchData('search', 'search', {
            jql       : jql,
            startAt   : (i - 1) * pageSize,
            maxResults: maxResults,
            fields    : fields,
            expand    : expand || defaultExpand
          });
          
          // append the results
          if (result.success === true && result.response) {
            debug && console.log('JiraIntegrator.executeQuery paging result starting at:', (i - 1) * pageSize, 'of', result.response.total, 'loaded');
            cumulativeIssues = cumulativeIssues.concat(result.response.issues);
          } else {
            return result
          }
        }
        
        // Return the full list as the payload of the last response
        result.response.issues = cumulativeIssues;
        return result
      }
    } else {
      return result
    }
  }
  
  /**
   * Take a raw query result and return an array of post-processed items
   * @param jql
   * @param startAt
   * @param maxResults
   * @param fields
   * @param expand
   */
  executeAndProcessQuery (jql, startAt, maxResults, fields, expand) {
    debug && console.log('JiraIntegrator.executeAndProcessQuery:', this.provider.server.title);
    let self      = this,
        rawResult = self.executeQuery(jql, startAt, maxResults, fields, expand);
    
    if (rawResult && rawResult.success && rawResult.response) {
      return rawResult.response.issues.map((rawItem) => {
        return self.provider.postProcessItem(rawItem)
      });
    } else {
      console.error('JiraIntegrator.executeAndProcessQuery encountered error:', rawResult);
      throw new Meteor.Error(500, 'JiraIntegrator.executeAndProcessQuery failed');
    }
  }
  
  /**
   * Post process a raw issue
   * @param rawItem
   */
  postProcessItem (rawItem) {
    trace && console.log('JiraIntegrator.postProcessItem:', this.provider.server.title);
    let self           = this,
        processedIssue = {};
    
    // Replace all of the custom field keys with the synthetic keys
    // Replace all of the people records with links to contributors
    _.keys(rawItem).sort().forEach((topLevelKey) => {
      if (topLevelKey === 'fields') {
        processedIssue.fields = {};
        
        _.keys(rawItem.fields).sort().forEach((fieldKey) => {
          let processedKey = fieldKey;
          if (fieldKey.match(/customfield_/i)) {
            // look up a synthetic key
            let fieldDef = self.provider.cache.fieldList.find((field) => {
              return field.id === fieldKey
            });
            if (fieldDef && fieldDef.syntheticKey) {
              processedKey = fieldDef.syntheticKey;
            }
          }
          
          // Deep copy the key:value over
          processedIssue.fields[ processedKey ] = JSON.parse(JSON.stringify(rawItem.fields[ fieldKey ]));
        });
      } else {
        processedIssue[ topLevelKey ] = JSON.parse(JSON.stringify(rawItem[ topLevelKey ]));
      }
    });
    
    return processedIssue
  }
  
  /**
   * Specialized post-processing to identify all contributors and replace those values with a contributor._id
   * @param processedData
   * @param level Recursion level
   */
  processItemForContributors (processedData, level) {
    trace && console.log('JiraIntegrator.processItemForContributors:', this.provider.server.title, level || 0);
    let self = this;
    
    // Guard against out of control recursion
    level = level || 0;
    if (level > 25) {
      console.error('JiraIntegrator.processItemForContributors deep recursion:', level);
      return;
    }
    
    // Deep process this issue (recursively call this function for all fields with an object value
    _.keys(processedData).forEach((key) => {
      // If this key points to an object, analyze it
      if (_.isObject(processedData[ key ])) {
        // Process contributors down to contributor ids
        let rawValue = processedData[ key ];
        if (rawValue.self && rawValue.self.match(/\/user\?/i)) {
          processedData[ key ] = self.provider.findOrCreateContributor(rawValue.key, rawValue.emailAddress, rawValue.displayName, rawValue)
        } else {
          // If it's not a contributor, call this function on the data
          self.processItemForContributors(processedData[ key ], level + 1);
        }
      }
    });
  }
  
  /**
   * Use the status map for this server to append the workState and workPhase values for this issue
   * @param processedItem
   * @param statusMap
   */
  processItemForStatus (processedItem, statusMap) {
    trace && console.log('IntegrationServiceProvider.processItemForStatus:', this.server._id, this.server.title);
    let self = this;
    
    // Check to see if there is
    if (processedItem.fields && processedItem.fields.status) {
      if (statusMap && statusMap[ processedItem.fields.status.id ]) {
        let mappedStatus          = statusMap[ processedItem.fields.status.id ];
        processedItem.statusId    = processedItem.fields.status.id;
        processedItem.statusLabel = processedItem.fields.status.name;
        processedItem.workPhase   = ImportedItemWorkPhases[ mappedStatus.workPhase ];
        processedItem.workState   = ImportedItemWorkStates[ mappedStatus.workState ];
      }
    }
    
    // Pull out any status changes from the item's history
    if (processedItem.changelog && processedItem.changelog.histories && processedItem.changelog.total) {
      processedItem.statusHistory = [];
      
      processedItem.changelog.histories.forEach((entry) => {
        let statusChangeList = entry.items.filter((item) => {
          if(item.fieldId){
            return item.fieldId && item.fieldId.toLowerCase() === 'status';
          } else {
            return item.field && item.field.toLowerCase() === 'status';
          }
        });
        if (statusChangeList && statusChangeList.length) {
          let item        = statusChangeList[ 0 ],
              statusEntry = {
                changeId: entry.id,
                date    : moment(entry.created).toDate(),
                owner   : entry.author,
                from    : {
                  id   : item.from,
                  label: item.fromString
                },
                to      : {
                  id   : item.to,
                  label: item.toString
              
                }
              };
          
          if (statusMap) {
            let fromStatus = statusMap[ item.from ],
                toStatus   = statusMap[ item.to ];
            
            statusEntry.from.workPhase = ImportedItemWorkPhases[ fromStatus.workPhase ];
            statusEntry.from.workState = ImportedItemWorkPhases[ fromStatus.workState ];
            statusEntry.to.workPhase   = ImportedItemWorkPhases[ toStatus.workPhase ];
            statusEntry.to.workState   = ImportedItemWorkPhases[ toStatus.workState ];
          }
          
          processedItem.statusHistory.push(statusEntry);
        }
      })
    }
  }
  
  /**
   * Call a client method to fetch data
   * @param {*} module
   * @param {*} method
   * @param {*} payload
   */
  fetchData (module, method, payload) {
    debug && console.log('JiraIntegrator.fetchData:', this.provider.server.title, module, method);
    let self = this;
    
    if (_.isObject(module)) {
      payload = module.payload;
      method  = module.method;
      module  = module.module;
    }
    
    payload = payload || {};
    
    if (self.client) {
      try {
        let result = self.client[ module ][ method ](payload)
            .then((response) => {
              //debug && console.log('JiraIntegrator.fetchData success result:', module, method, response);
              return { success: true, response: response };
            }, (response) => {
              //debug && console.log('JiraIntegrator.fetchData failure result:', module, method, response);
              try {
                response = JSON.parse(response);
                
                // The error response body is typically the HTML for a webpage, so ditch it
                delete response.body;
              } catch (e) {
                debug && console.log('JiraIntegrator.fetchData failure response parse error:', module, method, response, e);
              }
              return { success: false, response: response, error: response.statusCode };
            })
            .await();
        
        trace && console.log('JiraIntegrator.fetchData result:', module, method, result);
        
        if (result.response && result.response.values && result.response.maxResults && !payload.startAt && !result.response.isLast) {
          let pageSize          = result.response.maxResults,
              accumulatedValues = [].concat(result.response.values),
              i                 = 0;
          
          while (!result.response.isLast && i < 1000) {
            i += 1;
            payload.startAt = i * pageSize;
            trace && console.log('JiraIntegrator.fetchData paging more results:', i, payload.startAt, pageSize);
            result            = self.fetchData(module, method, payload);
            accumulatedValues = accumulatedValues.concat(result.response.values);
          }
          debug && console.log('JiraIntegrator.fetchPagedData paged data complete:', accumulatedValues.length);
          result.response.isLast     = true;
          result.response.startAt    = 0;
          result.response.maxResults = accumulatedValues.length;
          result.response.values     = accumulatedValues;
        }
        
        return result
      } catch (e) {
        console.error('JiraIntegrator.fetchData error:', e);
        return { success: false, error: e.toString() };
      }
    } else {
      return { success: false, error: 'No Jira client' };
    }
  }
  
  /**
   * Fetch data that could return more than one page and automatically page if that is the case
   */
  fetchPagedData (module, method, payload) {
    debug && console.log('JiraIntegrator.fetchPagedData:', this.provider.server.title, module, method);
    let self = this;
    
    if (_.isObject(module)) {
      payload = module.payload;
      method  = module.method;
      module  = module.module;
    }
    
    let result = self.fetchData(module, method, payload);
    if (!result.response.isLast) {
      payload = payload || {};
      
      let pageSize           = result.response.maxResults,
          accumulatedResults = [].contcat(result.response.values),
          i                  = 1;
      
      while (!result.response.isLast) {
        payload.startAt    = i * pageSize;
        result             = self.fetchData(module, method, payload);
        accumulatedResults = accumulatedResults.concat(result.response.values)
      }
      debug && console.log('JiraIntegrator.fetchPagedData getting page:', module, method);
    }
    
    return result;
  }
  
  /**
   * Log out from this integration
   */
  unAuthenticate () {
    throw new Meteor.Error(500, 'Integrator generic method called, must be overridden');
  }
}