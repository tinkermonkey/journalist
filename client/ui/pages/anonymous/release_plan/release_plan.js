import './release_plan.html';
import './release_plan.css';
import { Template }             from 'meteor/templating';
import { moment }               from 'meteor/momentjs:moment';
import { CapacityPlans }        from '../../../../../imports/api/capacity_plans/capacity_plans';
import { CapacityPlanReleases } from '../../../../../imports/api/capacity_plans/capacity_plan_releases';
import { CapacityPlanSprints }  from '../../../../../imports/api/capacity_plans/capacity_plan_sprints';
import { Releases }             from '../../../../../imports/api/releases/releases';
import '../../../components/releases/release_date_summary';
import './release_plan_cell';

/**
 * Template Helpers
 */
Template.ReleasePlan.helpers({
  releases () {
    let releaseIdList = CapacityPlanReleases.find({}).fetch().filter((planRelease) => {
          return planRelease.option() && planRelease.option().isSelectedOption()
        })
        .map((planRelease) => {
          return planRelease.releaseId
        });
    
    return Releases.find({ _id: { $in: releaseIdList } }, { sort: { internalReleaseDate: 1, releaseDate: 1 } })
  },
  sprints () {
    return Template.instance().sprints.get()
  }
});

/**
 * Template Event Handlers
 */
Template.ReleasePlan.events({});

/**
 * Template Created
 */
Template.ReleasePlan.onCreated(() => {
  let instance = Template.instance();
  
  // Create a place to cache the collected sprints
  instance.sprints = new ReactiveVar();
  
  instance.autorun(() => {
    
    CapacityPlans.find({}).forEach((plan) => {
      instance.subscribe('capacity_plan_options', plan._id);
      instance.subscribe('capacity_plan_releases', plan._id);
      instance.subscribe('capacity_plan_sprints', plan._id);
      instance.subscribe('capacity_plan_sprint_blocks', plan._id);
      instance.subscribe('capacity_plan_sprint_links', plan._id);
      instance.subscribe('capacity_plan_strategic_efforts', plan._id);
      instance.subscribe('capacity_plan_strategic_effort_items', plan._id);
    })
  });
  
  instance.autorun(() => {
    if (instance.subscriptionsReady()) {
      let optionIds = CapacityPlans.find({ isActive: true, selectedOptionId: { $exists: true } }).map((plan) => {
            return plan.selectedOptionId
          }),
          sprintMap = {},
          sprints;
      
      CapacityPlanSprints.find({ optionId: { $in: optionIds } }, { sort: { startDate: 1 } }).forEach((sprint) => {
        let key = sprint.startDate.getTime();
        if (sprintMap[ key ]) {
          sprintMap[ key ].planSprints.push(sprint)
        } else {
          let sprintLength = moment(sprint.endDate).isoWeek() - moment(sprint.startDate).isoWeek();
          sprintMap[ key ] = {
            startDate   : sprint.startDate,
            endDate   : sprint.endDate,
            sprintLength: sprintLength,
            weekNum: moment(sprint.startDate).isoWeek(),
            sprintNumber: Math.floor(moment(sprint.startDate).isoWeek() / sprintLength) + 1,
            planSprints : [ sprint ]
          };
        }
      });
      
      sprints = _.values(sprintMap).sort((a, b) => {
        return a.startDate > b.startDate ? 1 : -1
      });
      
      instance.sprints.set(sprints)
    }
  })
});

/**
 * Template Rendered
 */
Template.ReleasePlan.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ReleasePlan.onDestroyed(() => {
  
});
