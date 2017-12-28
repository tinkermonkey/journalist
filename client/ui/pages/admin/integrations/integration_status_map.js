import './integration_status_map.html';
import { Template } from 'meteor/templating';
import { IntegrationStatusMaps } from '../../../../../imports/api/integrations/integration_status_maps';
import { ImportedItemWorkStates } from '../../../../../imports/api/imported_items/imported_item_work_states';
import { ImportedItemWorkPhases } from '../../../../../imports/api/imported_items/imported_item_work_phases';
import { Util } from '../../../../../imports/api/util';
import './integration_server_status_reference';

/**
 * Template Helpers
 */
Template.IntegrationStatusMap.helpers({
  statusMap () {
    let mapId = FlowRouter.getParam('mapId');
    return IntegrationStatusMaps.findOne(mapId)
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
    let map              = this,
        statusList       = Template.instance().statusList.get() || [],
        mappedStatuses   = _.keys(map.mapping || {}),
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
Template.IntegrationStatusMap.events({
  'drop .status-drop-box' (e, instance, ui) {
    let dropBox       = $(e.target),
        statusElement = ui.helper,
        statusList    = instance.statusList.get() || [],
        phaseKey      = dropBox.attr('data-phase-key'),
        stateKey      = dropBox.attr('data-state-key'),
        statusId      = statusElement.attr('data-id'),
        status        = _.findWhere(statusList, { id: statusId }),
        mapId         = FlowRouter.getParam('mapId'),
        statusMap     = IntegrationStatusMaps.findOne(mapId);
    
    console.log('Drop:', status, phaseKey, stateKey, statusId, statusMap);
    
    if (status && phaseKey && stateKey && statusId && statusMap) {
      let mapping         = statusMap.mapping || {};
      mapping[ statusId ] = {
        workPhase: phaseKey,
        workState: stateKey,
        status   : status
      };
      Meteor.call('editIntegrationStatusMap', statusMap._id, 'mapping', mapping, (error, response) => {
        if (error) {
          console.error('editIntegrationStatusMap failed:', error);
        } else {
          console.log('editIntegrationStatusMap returned:', response);
        }
      });
    }
  },
  'click .btn-remove-status-mapping' (e, instance) {
    let statusElement = $(e.target).closest('.status-card'),
        statusId      = statusElement.attr('data-id'),
        mapId         = FlowRouter.getParam('mapId'),
        statusMap     = IntegrationStatusMaps.findOne(mapId);
    
    console.log('Remove Status Mapping:', statusId, statusMap);
    
    if (statusId && statusMap) {
      let mapping = statusMap.mapping || {};
      delete mapping[ statusId ];
      Meteor.call('editIntegrationStatusMap', statusMap._id, 'mapping', mapping, (error, response) => {
        if (error) {
          console.error('editIntegrationStatusMap failed:', error);
        } else {
          console.log('editIntegrationStatusMap returned:', response);
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.IntegrationStatusMap.onCreated(() => {
  let instance = Template.instance();
  
  instance.statusList = new ReactiveVar();
  instance.subscribe('integration_servers');
  
  instance.autorun(() => {
    let mapId     = FlowRouter.getParam('mapId'),
        statusMap = IntegrationStatusMaps.findOne(mapId);
    
    instance.subscribe('integration_status_map', mapId);
    instance.subscribe('integration_status_mappings', mapId);
    
    if (statusMap && statusMap.serverId) {
      Meteor.call('getIntegrationServerStatusList', statusMap.serverId, (error, response) => {
        if (error) {
          console.error('getIntegrationServerStatusList failed:', error);
        } else {
          //console.log('getIntegrationServerStatusList returned:', response);
          instance.statusList.set(response);
        }
      });
    }
  })
});

/**
 * Template Rendered
 */
Template.IntegrationStatusMap.onRendered(() => {
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
Template.IntegrationStatusMap.onDestroyed(() => {
  
});
