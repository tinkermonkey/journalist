import './default_release_contents.html';
import { Template }               from 'meteor/templating';
import { ItemTypes }              from '../../../../imports/api/imported_items/item_types';
import { ImportedItems }          from '../../../../imports/api/imported_items/imported_items';
import { ImportedItemWorkStates } from '../../../../imports/api/imported_items/imported_item_work_states';
import { Util }                   from '../../../../imports/api/util';
import '../../components/charts/imported_items/imported_item_project_donut';
import '../../components/charts/imported_items/imported_item_type_donut';
import '../../components/charts/imported_items/imported_item_work_phase_donut';
import '../../components/charts/imported_items/imported_item_work_state_donut';
import '../../components/charts/imported_items/imported_item_status_donut';
import '../../components/filter_bar/filter_bar';

/**
 * Template Helpers
 */
Template.DefaultReleaseContents.helpers({
  tabsDoorbell () {
    let instance = Template.instance(),
        query    = instance.query.get() || {};
    
    setTimeout(() => {
      let activeTab = RobaTabs.getActive(instance);
      RobaTabs.setActive({
        target: instance.$('ul[data-tab-group="release-contents-project-tabs"] > li.active > a[data-tab-name="' + activeTab + '"]').get(0)
      });
    }, 250);
  },
  workStates () {
    return _.keys(ImportedItemWorkStates).map((key) => {
      return {
        value: ImportedItemWorkStates[ key ],
        key  : key,
        title: Util.camelToTitle(key)
      }
    }).sort((a, b) => {
      return a.value > b.value ? 1 : -1
    })
  },
  workStateItemTableContext (workState) {
    let query       = Template.instance().query.get() || {},
        filterQuery = {
          $and: [
            query,
            { workState: workState.value }
          ]
        };
    
    return { query: filterQuery }
  },
  workStateCount (workState) {
    let query       = Template.instance().query.get() || {},
        filterQuery = {
          $and: [
            query,
            { workState: workState.value }
          ]
        };
    
    return ImportedItems.find(filterQuery).count()
  },
  totalItemCount () {
    let releaseId = Template.instance().releaseId.get();
    return ImportedItems.find({
      versionsFixed: releaseId,
      itemType     : { $in: [ ItemTypes.bug, ItemTypes.feature, ItemTypes.subtask, ItemTypes.epic ] }
    }).count()
  },
  itemCount () {
    let items = Template.instance().items.get();
    return items && items.length || 0;
  },
  items () {
    return Template.instance().items.get()
  },
  filterVar () {
    return Template.instance().filter
  },
  scaleVar () {
    return Template.instance().chartScale
  }
});

/**
 * Template Event Handlers
 */
Template.DefaultReleaseContents.events({});

/**
 * Template Created
 */
Template.DefaultReleaseContents.onCreated(() => {
  let instance = Template.instance();
  
  instance.releaseId  = new ReactiveVar();
  instance.filter     = new ReactiveVar();
  instance.query      = new ReactiveVar();
  instance.items      = new ReactiveVar();
  instance.chartScale = new ReactiveVar(1);
  
  instance.autorun(() => {
    let release = Template.currentData();
    
    instance.releaseId.set(release._id);
    instance.subscribe('imported_item_crumb_query', {
      versionsFixed: release._id,
      itemType     : { $in: [ ItemTypes.bug, ItemTypes.feature, ItemTypes.subtask, ItemTypes.epic ] }
    });
  });
  
  instance.autorun(() => {
    let query = instance.query.get();
    
    if (instance.subscriptionsReady() && query) {
      //console.log('Release.autorun loading importedItems list:', query);
      let items = ImportedItems.find(query).fetch();
      instance.items.set(items);
    }
  });
  
  instance.autorun(() => {
    let releaseId = instance.releaseId.get(),
        filter    = instance.filter.get() || {},
        query     = {
          versionsFixed: releaseId,
          itemType     : { $in: [ ItemTypes.bug, ItemTypes.feature, ItemTypes.subtask, ItemTypes.epic ] }
        };
    
    _.keys(filter).forEach((key) => {
      let filterItem          = filter[ key ];
      query[ filterItem.key ] = filterItem.value
    });
    //console.log('Release.autorun setting query:', query, filter);
    
    instance.query.set(query);
  })
});

/**
 * Template Rendered
 */
Template.DefaultReleaseContents.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.DefaultReleaseContents.onDestroyed(() => {
  
});
