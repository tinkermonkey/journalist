import { check }                                 from 'meteor/check';
import { Ping }                                  from 'meteor/frpz:ping';
import { SyncedCron }                            from 'meteor/percolate:synced-cron';
import SimpleSchema                              from 'simpl-schema';
import { Clustering }                            from 'meteor/austinsand:journalist-clustering';
import { Contributors }                          from '../../api/contributors/contributors';
import { ContributorTeamRoles }                  from '../../api/contributors/contributor_team_roles';
import { ContributorProjectAssignments }         from '../../api/contributors/contributor_project_assignments';
import { HealthTracker }                         from '../../api/system_health_metrics/server/health_tracker';
import { ImportedItems, ImportedItemTestSchema } from '../../api/imported_items/imported_items';
import { ImportedItemWorkStates }                from '../../api/imported_items/imported_item_work_states';
import { ImportedItemWorkPhases }                from '../../api/imported_items/imported_item_work_phases';
import { ImportedItemFetchQueue }                from '../../api/imported_items/imported_item_fetch_queue';
import { Integrations }                          from '../../api/integrations/integrations';
import { IntegrationServerCaches }               from '../../api/integrations/integration_server_caches';
import { IntegrationServers }                    from '../../api/integrations/integration_servers';
import { IntegrationTypes }                      from '../../api/integrations/integration_types';
import { ItemTypes }                             from '../../api/imported_items/item_types';
import { ReleaseIntegrationLinks }               from '../../api/releases/release_integration_links';
import { UserTypes }                             from '../../api/users/user_types';
import { ConfluenceIntegrator }                  from './integrators/confluence_integrator';
import { JiraIntegrator }                        from './integrators/jira_integrator';
import { IntegrationAgent }                      from './integration_agent';
import { CollectionMap }                         from '../../api/import_export_tool/server/import_export_tool';
import { Util }                                  from '../../api/util';

const { URL } = require('url');

let debug      = false,
    trace      = false,
    jobSpacing = 15000; // Put some temporal space between the integration agents

export class IntegrationServiceProvider {
  /**
   * IntegrationServiceProvider provides connectivity to IntegrationAgents
   * @param server {IntegrationServer}
   */
  constructor (server) {
    console.log('Creating new IntegrationServiceProvider:', server._id, server.title);
    let self     = this;
    self.agents  = {};
    self.healthy = false; // until proven otherwise
    
    // Store the server document
    self.server = server;
    
    // Initialize the local cache of integration data
    self.cache = { contributors: {} };
    self.loadCachedData();
    
    // Parse the base url
    self.parseBaseUrl();
    
    // Initialize the health tracker
    self.trackerKey = 'integration-server-' + server._id;
    HealthTracker.add(self.trackerKey, self.server.title, 'server');
    
    // Set the server auth flag to unauthenticated
    IntegrationServers.update({ _id: self.server._id }, { $set: { isAuthenticated: false } });
    
    // Observe the IntegrationServers collection for document updates
    // Needs to be deferred because you can't create observers in a call stack from another observer
    Meteor.defer(() => {
      self.observer = IntegrationServers.find({ _id: self.server._id }).observe({
        changed (newDoc, oldDoc) {
          debug && console.log('IntegrationServiceProvider.observer.changed:', newDoc._id, newDoc.title);
          
          // Update the local cache of the document
          self.server = newDoc;
          
          // Parse the URL if it changed
          if (self.server.baseUrl !== oldDoc.baseUrl) {
            self.parseBaseUrl();
          } else if (self.server.healthCheckFrequency !== oldDoc.healthCheckFrequency) {
            self.updateHealthCheckJob();
          }
        }
      });
    });
    
    // Create the Integrator for this provider
    switch (self.server.integrationType) {
      case IntegrationTypes.jira:
        self.integrator = new JiraIntegrator(self);
        break;
      case IntegrationTypes.confluence:
        self.integrator = new ConfluenceIntegrator(self);
        break;
    }
    
    // Monitor the Integrations collection to respond to additions, deletions, and modifications
    self.integrationObserver = Integrations.find({ serverId: self.server._id }).observe({
      addedAt (integration, index) {
        debug && console.log('IntegrationServiceProvider.integrationObserver.added:', integration._id);
        Meteor.setTimeout(() => {
          self.createIntegrationAgent(integration);
        }, index * jobSpacing);
      },
      removed (integration) {
        console.log('IntegrationServiceProvider.integrationObserver.removed:', integration._id);
        Meteor.defer(() => {
          self.destroyIntegrationAgent(integration);
        });
      }
    });
    
    // Schedule the health check job
    self.updateHealthCheckJob();
    
    // Schedule the cache service job
    self.updateCacheServiceJob();
    
    // Try getting up and running again
    self.reAuthenticate();
    self.checkHealth();
    //self.updateCachedData();
  }
  
  /**
   * Return the query definitions for an integration type
   * @param integrationType
   */
  static queryDefinitions (integrationType) {
    switch (integrationType) {
      case IntegrationTypes.jira:
        return JiraIntegrator.queryDefinitions();
      case IntegrationTypes.confluence:
        return ConfluenceIntegrator.queryDefinitions();
    }
  }
  
  /**
   * Get the query definitions for this provider
   */
  getQueryDefinitions () {
    return IntegrationServiceProvider.queryDefinitions(this.server.integrationType)
  }
  
  /**
   * Fetch the map of integration calls that can be made for this integration
   */
  integrationCallMap () {
    debug && console.log('IntegrationServiceProvider.integrationCallMap:', this.server._id, this.server.title);
    let self = this;
    
    return self.integrator.integrationCallMap();
  }
  
  /**
   * Retrieve a normalized list of statuses from the cache for this server
   */
  getCachedStatusList () {
    debug && console.log('IntegrationServiceProvider.getCachedStatusList:', this.server._id, this.server.title);
    let self = this;
    
    return self.integrator.getCachedStatusList();
  }
  
  /**
   * Create or update the cron job for updating the server health
   */
  updateHealthCheckJob () {
    debug && console.log('IntegrationServiceProvider.updateHealthCheckJob:', this.server._id, this.server.title);
    let self = this;
    
    if (Clustering.isMaster()) {
      SyncedCron.remove(self.trackerKey);
      
      SyncedCron.add({
        name: self.trackerKey,
        schedule (parser) {
          let parserText = self.server.healthCheckFrequency || 'every 5 minutes';
          debug && console.log('IntegrationServiceProvider.updateHealthCheckJob setting schedule:', self.server._id, self.server.title, "'", parserText, "'");
          return parser.text(parserText);
        },
        job () {
          self.checkHealth();
        }
      });
    }
  }
  
  /**
   * Create or update the cron job for updating the cached data for this server
   */
  updateCacheServiceJob () {
    debug && console.log('IntegrationServiceProvider.updateCacheServiceJob:', this.server._id, this.server.title);
    let self = this;
    
    if (Clustering.isMaster()) {
      SyncedCron.remove(self.trackerKey + '-cache');
      
      SyncedCron.add({
        name: self.trackerKey + '-cache',
        schedule (parser) {
          let parserText = self.server.cacheUpdateFrequency || 'every 30 minutes';
          debug && console.log('IntegrationServiceProvider.updateCacheServiceJob setting schedule:', self.server._id, self.server.title, "'", parserText, "'");
          return parser.text(parserText);
        },
        job () {
          self.updateCachedData();
        }
      });
    }
  }
  
  /**
   * Check the general health of the connection to this server
   */
  checkHealth () {
    debug && console.log('IntegrationServiceProvider.checkHealth:', this.server._id, this.server.title);
    let self    = this,
        details = {},
        healthy = true;
    
    // Make sure there's something to connect to
    if (self.url && self.url.hostname) {
      if (self.server.isAuthenticated === true) {
        // Ping the server
        debug && console.log('IntegrationServiceProvider.checkHealth pinging server:', self.url.hostname, self.url.port);
        try {
          let status = Ping.host(self.url.hostname, 3);
          healthy    = status.online === true;
          if (!healthy) {
            debug && console.log('IntegrationServiceProvider.checkHealth ping status:', status);
            details.message = 'Server did not respond to ping requests';
          }
        } catch (e) {
          console.error('IntegrationServiceProvider.checkHealth ping failed:', self.url.hostname, e);
          HealthTracker.update(self.trackerKey, false, { message: 'Ping failed' });
          self.healthy = false;
          return;
        }
        
        // Check an authenticated end point to make sure the server is authenticated
        if (healthy) {
          let authResult = self.integrator.checkAuthentication();
          healthy        = authResult.success === true;
          if (!healthy) {
            debug && console.log('IntegrationServiceProvider.checkHealth auth result:', authResult);
            details.message = 'Server is not authenticated';
            IntegrationServers.update({ _id: self.server._id }, { $set: { isAuthenticated: false } });
          }
        }
      } else {
        healthy         = false;
        details.message = 'Server is not authenticated';
        debug && console.log('IntegrationServiceProvider.checkHealth not authenticated:', self.url.hostname);
      }
      
      // Update the status
      self.healthy = healthy;
      HealthTracker.update(self.trackerKey, self.healthy, details);
    } else {
      self.healthy = false;
      HealthTracker.update(self.trackerKey, self.healthy, { message: 'No valid URL for server' });
    }
  }
  
  /**
   * Return the health based on the last check
   * @return {boolean}
   */
  isHealthy () {
    return this.healthy
  }
  
  /**
   * Authenticate to the server
   * @param username
   * @param password
   */
  authenticate (username, password) {
    debug && console.log('IntegrationServiceProvider.authenticate:', this.server._id, this.server.title, username);
    let self       = this,
        authResult = self.integrator.authenticate(username, password);
    
    // Update the authentication status
    IntegrationServers.update({ _id: self.server._id }, { $set: { isAuthenticated: authResult.success === true } });
    
    return authResult;
  }
  
  /**
   * Authenticate to the server
   */
  unAuthenticate () {
    debug && console.log('IntegrationServiceProvider.unAuthenticate:', this.server._id, this.server.title);
    let self   = this,
        result = self.integrator.unAuthenticate();
    
    // Update the authentication status
    IntegrationServers.update({ _id: self.server._id }, { $set: { isAuthenticated: false } });
    
    return result;
  }
  
  /**
   * Re-authenticate to the server
   */
  reAuthenticate () {
    debug && console.log('IntegrationServiceProvider.reAuthenticate:', this.server._id, this.server.title);
    let self       = this,
        authResult = self.integrator.reAuthenticate(self.server.authData);
    
    // Update the authentication status
    IntegrationServers.update({ _id: self.server._id }, { $set: { isAuthenticated: authResult.success === true } });
    
    return authResult;
  }
  
  /**
   * Store authentication data for this server
   * @param data
   */
  storeAuthData (data) {
    debug && console.log('IntegrationServiceProvider.storeAuthData:', this.server._id, this.server.title);
    let self = this;
    
    IntegrationServers.update({ _id: self.server._id }, { $set: { authData: data } });
  }
  
  /**
   * Clear stored authentication data for this server
   */
  clearAuthData () {
    console.error('IntegrationServiceProvider.clearAuthData:', this.server._id, this.server.title);
    let self = this;
    
    IntegrationServers.update({ _id: self.server._id }, {
      $unset: { authData: true },
      $set  : { isAuthenticated: false }
    });
  }
  
  /**
   * Fetch data from an integration server
   * @param request
   */
  fetchData (request) {
    debug && console.log('IntegrationServiceProvider.fetchData:', this.server._id, this.server.title);
    let self = this;
    
    // Fetch the data
    return self.integrator.fetchData(request);
  }
  
  /**
   * Pull all of the cached data out of the db
   */
  loadCachedData () {
    debug && console.log('IntegrationServiceProvider.loadCachedData:', this.server._id, this.server.title);
    let self = this;
    
    IntegrationServerCaches.find({ serverId: self.server._id }).forEach((cachedItem) => {
      self.cache[ cachedItem.key ] = cachedItem.value;
    });
  }
  
  /**
   * Update all of the cached data for this integration provider
   */
  updateCachedData () {
    debug && console.log('IntegrationServiceProvider.updateCachedData:', this.server._id, this.server.title);
    let self = this;
    
    if (self.isHealthy()) {
      return self.integrator.updateCachedData();
    }
  }
  
  /**
   * Store some cached data for this server
   * @param key
   * @param value
   */
  storeCachedItem (key, value) {
    debug && console.log('IntegrationServiceProvider.storeCachedItem:', this.server._id, this.server.title, key);
    let self = this;
    
    if (value && _.isArray(value)) {
      // Update the local in memory value
      self.cache[ key ] = value;
      
      // Update the stored value
      IntegrationServerCaches.upsert({
        serverId: self.server._id,
        key     : key
      }, {
        $set: {
          serverId: self.server._id,
          key     : key,
          value   : value
        }
      });
    } else {
      console.error('IntegrationServiceProvider.storeCachedItem passed an invalid value for key:', key, value);
    }
  }
  
  /**
   * Return the cached values for a given key
   * @param key
   */
  getCachedData (key) {
    debug && console.log('IntegrationServiceProvider.getCachedData:', this.server._id, this.server.title, key);
    let self = this;
    
    return self.cache[ key ]
  }
  
  /**
   * Pass an item through an import function to produce an importedItem
   * @param importFunction {IntegrationImportFunction}
   * @param processedItem {Object}
   * @param projectId {String}
   * @param calculatedFields {[IntegrationCalculatedField]} optional
   */
  importItem (importFunction, processedItem, projectId, calculatedFields) {
    trace && console.log('IntegrationServiceProvider.importItem:', this.server._id, this.server.title, projectId, (calculatedFields || []).length);
    let self = this;
    
    // Attempt to process the item through the import function
    // Needs to be able to access ReleaseIntegrationLinks
    try {
      let importFn      = new Function('processedItem', 'importContext', importFunction.code),
          importContext = {
            enum               : {
              ItemTypes             : ItemTypes,
              ImportedItemWorkPhases: ImportedItemWorkPhases,
              ImportedItemWorkStates: ImportedItemWorkStates,
              IntegrationTypes      : IntegrationTypes,
              UserTypes             : UserTypes
            },
            Util               : Util,
            integrationProvider: self,
            projectId          : projectId,
            server             : self.server,
            collections        : CollectionMap,
            ImportedItems      : ImportedItems
          },
          importedItem  = importFn(processedItem, importContext);
      
      // Set the serverId
      importedItem.serverId = self.server._id;
      
      // Pull in some details
      importedItem.viewUrl  = processedItem.viewUrl;
      importedItem.links    = processedItem.links;
      importedItem.metadata = processedItem.metadata;
      
      // Store the full processedItem as the document field
      importedItem.document = processedItem;
      
      // Copy over all of the status information
      importedItem.statusId    = processedItem.statusId;
      importedItem.statusLabel = processedItem.statusLabel;
      importedItem.workPhase   = processedItem.workPhase;
      importedItem.workState   = processedItem.workState;
      
      // Try to identify the team
      if (importedItem.owner && projectId) {
        importedItem.teamId = ContributorProjectAssignments.find({
          contributorId: importedItem.owner,
          projectId    : projectId
        }).map((projectAssignment) => {
          let role = projectAssignment.teamRole();
          return role && role.teamId
        });
      } else if (importedItem.owner) {
        importedItem.teamId = ContributorTeamRoles.find({
          contributorId: importedItem.owner
        }).map((teamRole) => {
          return teamRole.teamId
        });
      }
      
      // Process all of the calculated fields
      if (calculatedFields && calculatedFields.length) {
        importedItem.metadata = importedItem.metadata || {};
        calculatedFields.forEach((calculatedField) => {
          // try calculating the value
          try {
            trace && console.log('IntegrationServiceProvider.importItem calculating field:', calculatedField.title);
            
            let calcFn = new Function('processedItem', 'importContext', calculatedField.code);
            
            // Calculate and store the value
            importedItem.metadata[ calculatedField.title ] = calcFn(importedItem, importContext);
          } catch (e) {
            console.error('IntegrationCalculatedField calculation failed:', calculatedField.title, e);
          }
        })
      }
      
      // Validate the processed item against the importedItem schema
      try {
        ImportedItemTestSchema.validate(importedItem);
        
        return {
          success: true,
          item   : importedItem
        }
      } catch (e) {
        return {
          success: false,
          error  : e.toString(),
          item   : importedItem
        }
      }
    } catch (e) {
      return {
        success: false,
        error  : e.toString()
      }
    }
  }
  
  /**
   * Pass an array of items through an import function to produce an array of importedItems
   * @param importFunction
   * @param processedItems
   * @param projectId
   * @param calculatedFields {[IntegrationCalculatedField]} optional
   */
  importItems (importFunction, processedItems, projectId, calculatedFields) {
    debug && console.log('IntegrationServiceProvider.importItems:', this.server._id, this.server.title, processedItems.length);
    let self   = this,
        result = {
          items   : [],
          failures: []
        };
    
    // import each of the processed items
    processedItems.forEach((item) => {
      let importResult = self.importItem(importFunction, item, projectId, calculatedFields);
      if (importResult.success === true) {
        result.items.push(importResult.item)
      } else {
        importResult.processedItem = item;
        result.failures.push(importResult)
      }
    });
    
    debug && console.log('IntegrationServiceProvider.importItems complete:', this.server._id, this.server.title, processedItems.length);
    
    return result
  }
  
  /**
   * Import the results of a query
   * @param projectId {String}
   * @param importFunction {IntegrationImportFunction}
   * @param query {String}
   * @param limit {Number} optional
   * @param calculatedFields {[IntegrationCalculatedField]} optional
   */
  importItemsFromQuery (projectId, importFunction, query, limit, calculatedFields) {
    debug && console.log('IntegrationServiceProvider.importItemsFromQuery:', projectId, this.server._id, this.server.title);
    let self           = this,
        processedItems = self.integrator.executeAndProcessQuery(query, 0, limit);
    
    return self.importItems(importFunction, processedItems, projectId, calculatedFields)
  }
  
  /**
   * Test an import function by fetching an issue and running it through the pipeline
   * @param importFunction
   * @param identifier
   * @param projectId
   * @param calculatedFields {[IntegrationCalculatedField]} optional
   */
  testImportFunction (importFunction, identifier, projectId, calculatedFields) {
    console.log('IntegrationServiceProvider.testImportFunction:', this.server._id, this.server.title, importFunction && importFunction._id, identifier, projectId, calculatedFields);
    let self          = this,
        rawItem       = self.integrator.fetchItem(identifier),
        processedItem = self.postProcessItem(rawItem);
    
    return {
      rawItem      : rawItem,
      processedItem: processedItem,
      importResult : self.importItem(importFunction, processedItem, projectId, calculatedFields)
    }
  }
  
  /**
   * Test an integration by executing the query to fetch some issues and returning the imported (but not stored) results
   * @param integration
   * @param details
   */
  testIntegration (integration, details) {
    debug && console.log('IntegrationServiceProvider.testIntegration:', this.server._id, this.server.title, integration._id);
    let self = this;
    
    return self.integrator.testIntegration(integration, details)
  }
  
  /**
   * Post process a raw issue
   * @param rawItem
   */
  postProcessItem (rawItem) {
    trace && console.log('IntegrationServiceProvider.postProcessItem:', this.server._id, this.server.title);
    let self          = this,
        processedItem = self.integrator.postProcessItem(rawItem);
    
    // Get all of the contributors involved
    self.integrator.processItemForContributors(processedItem);
    
    // Map the status
    self.integrator.processItemForStatus(processedItem, self.server.statusMap);
    
    // Map all of the links
    self.integrator.processItemForLinks(processedItem);
    
    // Set the view link
    self.integrator.processItemForViewUrl(processedItem);
    
    return processedItem;
  }
  
  /**
   * Store an imported item
   * @param integrationId
   * @param projectId
   * @param itemType {ItemTypes}
   * @param item
   */
  storeImportedItem (integrationId, projectId, itemType, item) {
    trace && console.log('IntegrationServiceProvider.storeImportedItem:', this.server._id, this.server.title, item && item.identifier);
    let self = this;
    
    check(integrationId, String);
    check(projectId, String);
    check(itemType, Number);
    check(item, Object);
    check(item.identifier, String);
    
    // Set the defaults for the item to prevent stale data from lingering
    _.defaults(item, {
      teamId       : [],
      statusHistory: [],
      versionsFound: [],
      versionsFixed: [],
      links        : [],
      metadata     : {}
    });
    
    if (item.identifier.length) {
      // Set the lastImported date
      item.lastImported = Date.now();
      
      // Cache the links to insert individually
      let cachedLinks = _.clone(item.links) || [];
      item.links      = [];
      
      // Upsert the item
      ImportedItems.upsert({
        integrationId: integrationId,
        projectId    : projectId,
        itemType     : itemType,
        identifier   : item.identifier
      }, {
        $set: item
      });
      
      // Grab the record fresh to make we have the _id
      let importedItem = ImportedItems.findOne({
        integrationId: integrationId,
        projectId    : projectId,
        itemType     : itemType,
        identifier   : item.identifier
      });
      
      // Insert the links that came with this
      cachedLinks.forEach((link) => {
        try {
          ImportedItems.update(importedItem._id, {
            $push: {
              links: link
            }
          });
        } catch (e) {
          console.error('IntegrationServiceProvider.storeImportedItem failed to store parsed link:', importedItem.identifier, '->', link.identifier, e);
        }
      });
      
      // Refresh local copy
      importedItem = ImportedItems.findOne(importedItem._id);
      
      // Make sure that all links on this item are reciprocated back from the linked item
      if (importedItem.links) {
        importedItem.links.forEach((link) => {
          // Check for an existing link back from the linked item
          let linkedItem           = ImportedItems.findOne({ _id: link.itemId }),
              linkedItemLinkIds    = (linkedItem.links || []).map((l) => {
                return l.itemId
              }),
              hasReciprocatingLink = _.contains(linkedItemLinkIds, importedItem._id);
          
          // Create a link if one doesn't exist
          if (!hasReciprocatingLink) {
            trace && console.log('IntegrationServiceProvider.storeImportedItem creating new inbound link:', linkedItem._id);
            try {
              ImportedItems.update(linkedItem._id, {
                $push: {
                  links: {
                    itemId        : importedItem._id,
                    itemType      : importedItem.itemType,
                    itemIdentifier: importedItem.identifier,
                    itemTitle     : importedItem.title,
                    itemViewUrl   : importedItem.viewUrl,
                    linkId        : link.linkId,
                    linkType      : link.linkType,
                    dateCreated   : link.dateCreated
                  }
                }
              });
            } catch (e) {
              console.error('IntegrationServiceProvider.storeImportedItem failed to store inbound link:', linkedItem.identifier, '->', importedItem.identifier, e);
            }
          }
        });
      }
      
      // Refresh local copy
      importedItem = ImportedItems.findOne(importedItem._id);
      
      // Make sure that all links to this item are reciprocated back to the linking item
      let linkedItemIds = (importedItem.links || []).map((link) => {
        return link.itemId
      });
      ImportedItems.find({ _id: { $nin: linkedItemIds }, links: { itemId: importedItem._id } }).forEach((linkingItem) => {
        // Locate the link from the linking item back to the item being imported
        let link = _.find(linkingItem.links, (link) => {
          return link.itemId === importedItem._id
        });
        if (link) {
          trace && console.log('IntegrationServiceProvider.storeImportedItem creating new outbound link:', importedItem._id, importedItem.identifier, '->', linkedItem._id, linkedItem.identifier);
          try {
            ImportedItems.update(importedItem._id, {
              $push: {
                links: {
                  itemId        : linkingItem._id,
                  itemType      : linkingItem.itemType,
                  itemIdentifier: linkingItem.identifier,
                  itemTitle     : linkingItem.title,
                  itemViewUrl   : linkingItem.viewUrl,
                  linkId        : link.linkId,
                  linkType      : link.linkType,
                  dateCreated   : link.dateCreated
                }
              }
            });
          } catch (e) {
            console.error('IntegrationServiceProvider.storeImportedItem failed to store outbound link:', importedItem.identifier, '->', linkingItem.identifier, e);
          }
        }
      });
      
      // Scrub for duplicate links
      importedItem = ImportedItems.findOne(importedItem._id);
      if (importedItem.links && importedItem.links.length) {
        let linkCounts = {};
        importedItem.links.forEach((link) => {
          if (linkCounts[ link.linkId ] && linkCounts[ link.linkId ].count > 0) {
            linkCounts[ link.linkId ].count += 1;
          } else {
            linkCounts[ link.linkId ] = {
              link : link,
              count: 1
            };
          }
        });
        
        _.keys(linkCounts).forEach((linkId) => {
          let linkCount = linkCounts[ linkId ];
          if (linkCount.count > 1) {
            console.error('IntegrationServiceProvider.storeImportedItem removing duplicate links:', importedItem._id, importedItem.identifier, '->', linkCount.link.itemIdentifier);
            // Remove duplicated
            ImportedItems.update(importedItem._id, {
              $pull: {
                links: {
                  linkId: linkCount.linkId
                }
              }
            });
            
            // Insert the link
            ImportedItems.update(importedItem._id, {
              $push: {
                links: linkCount.link
              }
            });
          }
        });
      }
    } else {
      console.error('IntegrationServiceProvider.storeImportedItem failed:', this.server._id, this.server.title, item && item.identifier);
      throw new Meteor.Error(500, 'storeImportedItem could not determine item identifier')
    }
  }
  
  /**
   * Store the identifier of an issue that needs to be imported
   */
  queueItemImport (identifier) {
    trace && console.log('IntegrationServiceProvider.queueItemImport:', this.server._id, this.server.title, identifier);
    let self = this;
    
    ImportedItemFetchQueue.upsert({
      serverId  : self.server._id,
      identifier: identifier
    }, {
      $set: {
        serverId  : self.server._id,
        identifier: identifier
      }
    });
  }
  
  /**
   * Given a key identifier (email address, etc), find or create a contributor record to match
   * Maintain a local cache of contributors that have been identified
   * @param key
   * @param email
   * @param name
   * @param rawData
   */
  findOrCreateContributor (key, email, name, rawData) {
    trace && console.log('IntegrationServiceProvider.findOrCreateContributor:', this.server._id, this.server.title, key);
    let self = this;
    
    // Validate the data to make sure it's safe to proceed
    if (!_.isString(key) && key.length && _.isString(email) && email.length && _.isString(name) && name.length) {
      console.error('IntegrationServiceProvider.findOrCreateContributor passed invalid data:', key, email, name);
      return rawData;
    }
    
    // Force the email and key to lowercase
    email = email.toLowerCase().trim();
    
    // Check the local cache
    if (self.cache.contributors[ key ]) {
      return self.cache.contributors[ key ]
    } else {
      // Check the db for a known contributor
      let identifier  = self.server.contributorIdentifier(key),
          contributor = Contributors.findOne({ identifiers: identifier });
      
      if (contributor) {
        self.cache.contributors[ key ] = contributor._id;
      } else {
        // Check for a contributor with this email address
        contributor = Contributors.findOne({ email: email });
        
        if (contributor) {
          self.cache.contributors[ key ] = contributor._id;
        } else {
          // Create the contributor
          let doc                         = {
            email      : email,
            name       : name,
            identifiers: [ identifier ],
            profiles   : {},
            usertype   : UserTypes.contributor
          };
          doc.profiles[ self.server._id ] = _.isObject(rawData) ? rawData : { data: rawData };
          self.cache.contributors[ key ]  = Contributors.insert(doc);
          debug && console.log('IntegrationServiceProvider.findOrCreateContributor created contributor:', key);
        }
      }
      return self.cache.contributors[ key ]
    }
  }
  
  /**
   * Create a new integration agent
   * @param {*} integration
   */
  createIntegrationAgent (integration) {
    console.log('IntegrationServiceProvider.createIntegrationAgent:', integration._id);
    let self = this;
    
    // Create the service if the integration is active
    let agent = self.getIntegrationAgent(integration);
    if (agent == null) {
      agent = new IntegrationAgent(integration, self);
      self.setIntegrationAgent(integration, agent);
    } else {
      console.error('IntegrationServiceProvider.createIntegrationAgent integration already exists:', integration._id);
    }
    
    // Execute the queries to get fresh data
    agent.executeAllQueries();
  }
  
  /**
   * Set the IntegrationAgent for a given integration
   * @param integration {IntegrationServer}
   * @param agent {IntegrationAgent}
   */
  setIntegrationAgent (integration, agent) {
    debug && console.log('IntegrationServiceProvider.setIntegrationAgent:', integration._id);
    
    this.agents[ integration._id ] = agent;
  }
  
  /**
   * Retrieve the IntegrationAgent for a given integration
   * @param integration {IntegrationServer}
   */
  getIntegrationAgent (integration) {
    debug && console.log('IntegrationServiceProvider.getIntegrationAgent:', integration._id);
    
    return this.agents && this.agents[ integration._id ];
  }
  
  /**
   * Handle a change to a integration agent
   * Really only care about active/inactive, other changes are handled by the provider itself
   * @param {*} newDoc
   * @param {*} oldDoc
   */
  updateIntegrationAgent (newDoc, oldDoc) {
    console.log('IntegrationServiceProvider.updateIntegrationAgent:', newDoc._id);
    let self = this;
    
    // Respond to integration active flag changes
    /*
    if (newDoc.isActive !== oldDoc.isActive) {
      if (newDoc.isActive) {
        self.createIntegrationAgent(newDoc);
      } else {
        self.destroyIntegrationAgent(newDoc);
      }
    }
    */
  }
  
  /**
   * Destroy a service provider
   * @param {*} integration
   */
  destroyIntegrationAgent (integration) {
    console.log('IntegrationServiceProvider.destroyIntegrationAgent:', integration._id);
    let self  = this,
        agent = self.getServiceProvider(integration);
    
    if (agent) {
      agent.destroy();
      delete self.agents[ integration._id ];
    }
  }
  
  /**
   * Parse the server's baseUrl into a URL object
   */
  parseBaseUrl () {
    debug && console.log('IntegrationServiceProvider.parseBaseUrl:', this.server._id, this.server.title);
    let self = this;
    
    // Parse the base url
    try {
      self.url = new URL(self.server.baseUrl);
    } catch (e) {
      console.error('IntegrationServiceProvider could not parse baseUrl:', self.server.baseUrl, e);
    }
  }
  
  /**
   * Shut this provider down in prep for being deleted
   */
  destroy () {
    console.log('IntegrationServiceProvider.destroy:', this.server._id, this.server.title);
    let self = this;
    
    // Shut down the change observer
    self.observer.stop();
    
    // Remove the HealthTracker data
    HealthTracker.remove(self.trackerKey);
    
    // Remove the cron job to check status & cache
    if (Clustering.isMaster()) {
      SyncedCron.remove(self.trackerKey);
      SyncedCron.remove(self.trackerKey + '-cache');
    }
  }
}