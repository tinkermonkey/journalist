import './weekly_support_report.html';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { ImportedItems } from '../../../../../imports/api/imported_items/imported_items';
import { ImportedItemCrumbs } from '../../../../../imports/api/imported_items/imported_item_crumbs';
import { ItemTypes } from '../../../../../imports/api/imported_items/item_types';
import { Projects } from '../../../../../imports/api/projects/projects';
import '../../../components/charts/donut_chart';
import '../../../components/charts/bar_chart';

/**
 * Template Helpers
 */
Template.WeeklySupportReport.helpers({
  project() {
    let projectId = FlowRouter.getParam('projectId');
    return Projects.findOne(projectId);
  },
  dateRange() {
    return Template.instance().dateRange.get()
  },
  installationsAffected() {
    let project = this,
      dateRange = Template.instance().dateRange.get(),
      supportTickets = Template.instance().supportTickets.get(),
      data = _.flatten(supportTickets.map((item) => { return item.document.fields.installationsaffected }));

    return {
      cssClass: 'donut-flex',
      config: {
        callouts: {
          show: true,
          align: false
        },
        chart: {
          donut: {
            title: { text: ['Installations Affected'], showTotal: true, totalType: 'unique' },
            label: {
              format(value, ratio, id) {
                return value
              }
            }
          },
          legend: {
            show: false
          }
        },
        renderLabel(value) {
          return value
        },
      },
      data: data
    }
  },
  supportAreas() {
    let project = this,
      dateRange = Template.instance().dateRange.get(),
      supportTickets = Template.instance().supportTickets.get(),
      data = _.flatten(supportTickets.map((item) => { return item.document.fields.supportarea }));

    return {
      cssClass: 'donut-flex',
      config: {
        callouts: {
          show: true,
          align: false
        },
        chart: {
          donut: {
            title: { text: ['Support Areas'], showTotal: true, totalType: 'unique' },
            label: {
              format(value, ratio, id) {
                return value
              }
            }
          },
          legend: {
            show: false
          }
        },
        renderLabel(value) {
          return value
        },
      },
      data: data
    }
  },
  supportTicketAge() {
    let project = this,
      segments = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
      dateRange = Template.instance().dateRange.get(),
      supportTickets = Template.instance().supportTickets.get(),
      ticketAges = supportTickets.map((item) => { return moment().diff(moment(item.dateCreated), 'days') }),
      segmentedData = segments.map((floor, i) => {
        let ceiling = i < segments.length - 1 ? segments[i + 1] : 10000;
        return {
          title: i < segments.length - 1 ? floor.toString() + ' - ' + ceiling.toString() : floor.toString() + '+',
          value: ticketAges.filter((dataPoint) => { return dataPoint >= floor && dataPoint < ceiling })
        }
      });

    return {
      cssClass: 'bar-flex',
      config: {
        keyAttribute: 'title',
        valueAttribute: 'value',
        renderLabel(value) {
          return value + ' Tickets'
        },
        chart: {
          axis: {
            x: {
              type: 'category',
              categories: segmentedData.map((d) => { return d.title })
            }
          },
          legend: {
            show: false
          }
        }
      },
      data: ['Tickets'].concat(segmentedData.map((d) => { return d.value.length }))
    }
  },
  fixVersions() {
    let project = this,
      dateRange = Template.instance().dateRange.get(),
      supportTickets = Template.instance().supportTickets.get(),
      linkedItems = Template.instance().linkedItems.get(),
      fixVersions = _.flatten(linkedItems.map((itemKey) => {
        let item = ImportedItems.findOne({ 'identifier': itemKey });
        if(item && item.document.fields.fixVersions){
          return item.document.fields.fixVersions
        }
      }).filter((item) => { return item !== undefined}));

    return {
      cssClass: 'donut-flex',
      config: {
        callouts: {
          show: true,
          align: false
        },
        valueAttribute: 'name',
        chart: {
          donut: {
            title: { text: ['Planned Fixes'], showTotal: true },
            label: {
              format(value, ratio, id) {
                return value
              }
            }
          },
          legend: {
            show: false
          }
        },
        renderLabel(value) {
          return value
        },
      },
      data: fixVersions
    }
  }
});

/**
 * Template Event Handlers
 */
Template.WeeklySupportReport.events({});

/**
 * Template Created
 */
Template.WeeklySupportReport.onCreated(() => {
  let instance = Template.instance(),
    firstDay = moment().weekday() > 4 ? moment().startOf('week') : moment().subtract(7).startOf('week'),
    dateRange = {
      start: firstDay.toDate(),
      end: firstDay.add(7, 'days').toDate()
    };

  instance.dateRange = new ReactiveVar(dateRange);
  console.log('WeeklySupportReport created date range:', dateRange);

  instance.supportTickets = new ReactiveVar([]);
  instance.supportTicketQuery = new ReactiveVar();
  instance.linkedItems = new ReactiveVar([]);

  instance.autorun(() => {
    let projectId = FlowRouter.getParam('projectId'),
      dateRange = instance.dateRange.get(),
      supportTicketQuery = {
        projectId: projectId,
        itemType: ItemTypes.supportTicket,
        $or: [
          { dateCreated: { $gte: dateRange.start, $lte: dateRange.end } },
          { statusLabel: { $not: /resolved/i } },
          {
            statusHistory: {
              $elemMatch: {
                date: { $gte: dateRange.start, $lte: dateRange.end },
                'to.label': { $regex: 'resolved', $options: 'i' }
              }
            }
          },
        ]
      };


    //instance.subscribe('imported_item_crumb_query', { projectId: projectId });
    instance.subscribe('imported_item_query', supportTicketQuery);
    instance.supportTicketQuery.set(supportTicketQuery);
  });

  instance.autorun(() => {
    let projectId = FlowRouter.getParam('projectId'),
      dateRange = instance.dateRange.get(),
      supportTicketQuery = instance.supportTicketQuery.get(),
      supportTickets = ImportedItems.find(supportTicketQuery).fetch(),
      linkedItems = _.flatten(supportTickets.map((item) => {
        let links = item.document.fields.issuelinks;
        if (links && links.length) {
          return links.map((link) => {
            if (link.outwardIssue) {
              return link.outwardIssue.key
            } else {
              return link.inwardIssue && link.inwardIssue.key
            }
          });
        }
      })).filter((item) => { return item !== undefined});

    instance.supportTickets.set(supportTickets);
    instance.linkedItems.set(linkedItems);

   // console.log('supportTickets autorun:', supportTickets.length);
  });

  instance.autorun(() => {
    let linkedItems = instance.linkedItems.get();

    //console.log('linkedItems autorun:', linkedItems);
    instance.subscribe('imported_item_query', {
      'identifier': { $in: linkedItems }
    });
  });
});

/**
 * Template Rendered
 */
Template.WeeklySupportReport.onRendered(() => {
});

/**
 * Template Destroyed
 */
Template.WeeklySupportReport.onDestroyed(() => {

});
