import './integration_server_status_map.html';
import './integration_server_status_map.css';
import { Template } from 'meteor/templating';
import { IntegrationServers } from '../../../../../imports/api/integrations/integration_servers';
import { ImportedItemWorkStates } from '../../../../../imports/api/imported_items/imported_item_work_states';
import { ImportedItemWorkPhases } from '../../../../../imports/api/imported_items/imported_item_work_phases';
import { Util } from '../../../../../imports/api/util';
import './integration_server_status_reference';

/**
 * Template Helpers
 */
Template.IntegrationServerStatusMap.helpers({
  server () {
    let serverId = FlowRouter.getParam('serverId');
    
    return IntegrationServers.findOne(serverId)
  },
  statusMap () {
    let serverId = FlowRouter.getParam('serverId'),
        server   = IntegrationServers.findOne(serverId);
    
    return server && server.statusMap || {}
  },
  workStates () {
    return _.keys(ImportedItemWorkStates).map((workState) => {
      return { key: workState, title: Util.camelToTitle(workState) }
    })
  },
  workPhases () {
    return _.keys(ImportedItemWorkPhases).map((workPhase) => {
      return { key: workPhase, title: Util.camelToTitle(workPhase) }
    })
  },
  unmappedStatuses () {
    let statusMap        = this,
        statusList       = Template.instance().statusList.get() || [],
        mappedStatuses   = _.keys(statusMap),
        unmappedStatuses = [];
    
    statusList.forEach((status) => {
      if (!_.contains(mappedStatuses, status.id)) {
        unmappedStatuses.push(status);
      }
    });
    
    return _.sortBy(unmappedStatuses, 'title')
  }
});

/**
 * Template Event Handlers
 */
Template.IntegrationServerStatusMap.events({
  'drop .status-drop-box' (e, instance, ui) {
    let dropBox       = $(e.target),
        statusElement = ui.helper,
        statusList    = instance.statusList.get() || [],
        phaseKey      = dropBox.attr('data-phase-key'),
        stateKey      = dropBox.attr('data-state-key'),
        statusId      = statusElement.attr('data-id'),
        rawStatus     = _.findWhere(statusList, { id: statusId }),
        serverId      = FlowRouter.getParam('serverId'),
        server        = IntegrationServers.findOne(serverId),
        statusMap     = server.statusMap || {};
    
    console.log('Drop:', rawStatus, phaseKey, stateKey, statusId, statusMap);
    
    if (rawStatus && phaseKey && stateKey && statusId) {
      statusMap[ statusId ] = {
        workPhase: phaseKey,
        workState: stateKey,
        status   : rawStatus
      };
      Meteor.call('editIntegrationServer', serverId, 'statusMap', statusMap, (error, response) => {
        if (error) {
          console.error('editIntegrationServer failed:', error);
        } else {
          console.log('editIntegrationServer returned:', response);
          instance.$('.status-card').height('auto');
        }
      });
    }
  },
  'click .btn-remove-status-mapping' (e, instance) {
    let statusElement = $(e.target).closest('.status-card'),
        statusId      = statusElement.attr('data-id'),
        serverId      = FlowRouter.getParam('serverId'),
        server        = IntegrationServers.findOne(serverId),
        statusMap     = server.statusMap || {};
    
    console.log('Remove Status Mapping:', statusId, statusMap);
    
    if (statusId && statusMap) {
      delete statusMap[ statusId ];
      Meteor.call('editIntegrationServer', serverId, 'statusMap', statusMap, (error, response) => {
        if (error) {
          console.error('editIntegrationServer failed:', error);
        } else {
          console.log('editIntegrationServer returned:', response);
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.IntegrationServerStatusMap.onCreated(() => {
  let instance = Template.instance();
  
  instance.statusList = new ReactiveVar();
  
  instance.autorun(() => {
    let serverId = FlowRouter.getParam('serverId');
    
    instance.subscribe('integration_server', serverId);
    
    Meteor.call('getIntegrationServerStatusList', serverId, (error, response) => {
      if (error) {
        console.error('getIntegrationServerStatusList failed:', error);
      } else {
        instance.statusList.set(response);
      }
    });
  })
});

/**
 * Template Rendered
 */
Template.IntegrationServerStatusMap.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    let statusList = instance.statusList.get();
    
    if (statusList) {
      setTimeout(() => {
        instance.$('.status-card').draggable({
          revert        : true,
          revertDuration: 0
        });
        
        instance.$('.status-drop-box').droppable({
          hoverClass : 'status-drop-box-hover',
          activeClass: 'status-drop-box-active',
          tolerance  : 'pointer'
        });
      }, 1000);
    }
  })
});

/**
 * Template Destroyed
 */
Template.IntegrationServerStatusMap.onDestroyed(() => {
  
});