import './release.html';
import { Template }               from 'meteor/templating';
import { Releases }               from '../../../../imports/api/releases/releases';
import { ImportedItemWorkStates } from '../../../../imports/api/imported_items/imported_item_work_states';
import { Util }                   from '../../../../imports/api/util';

/**
 * Template Helpers
 */
Template.Release.helpers({
  release(){
    let releaseId = FlowRouter.getParam('releaseId');
    return Releases.findOne(releaseId)
  },
  workStates () {
    return _.keys(ImportedItemWorkStates).map((key) => {
      return {
        value: ImportedItemWorkStates[ key ],
        key  : key,
        title: Util.camelToTitle(key)
      }
    })
  },
  workStateItemTableContext (project, release) {
    let workState = this;
    
    console.log('Release.workStateItemTableContext:', workState, project, release);
    
    return {
      query: {
        projectId: project._id,
        workState: workState.value,
        versionsFixed: release._id
      }
    }
  }
});

/**
 * Template Event Handlers
 */
Template.Release.events({});

/**
 * Template Created
 */
Template.Release.onCreated(() => {
  let instance = Template.instance()
});

/**
 * Template Rendered
 */
Template.Release.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.Release.onDestroyed(() => {
  
});
