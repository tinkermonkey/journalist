import './weekly_support_report.html';
import { Template } from 'meteor/templating';
import { moment } from 'meteor/momentjs:moment';
import { ImportedItems } from '../../../../../imports/api/imported_items/imported_items';
import { ImportedItemCrumbs } from '../../../../../imports/api/imported_items/imported_item_crumbs';
import { ItemTypes } from '../../../../../imports/api/imported_items/item_types';
import { Projects } from '../../../../../imports/api/projects/projects';
import '../../../components/charts/donut_chart';
import '../../../components/charts/bar_chart';
import '../reports.css';

/**
 * Template Helpers
 */
Template.WeeklySupportReport.helpers({
  reportProject() {
    let projectId = FlowRouter.getParam('projectId');
    return Projects.findOne(projectId);
  },
  dateRange() {
    return Template.instance().dateRange.get()
  },
  isForPrint() {
    return FlowRouter.getQueryParam('print')
  },
  linkedFix() {
    let link = this,
      issueKey = (link.outwardIssue || link.inwardIssue).key;

    return ImportedItems.findOne({
      itemType: { $in: [ItemTypes.bug, ItemTypes.feature] },
      identifier: issueKey
    })
  },
  fixVersionList() {
    return this.document.fields.fixVersions.map((version) => { return version.name }).join(', ')
  },
  newTicketsCount() {
    let dateRange = Template.instance().dateRange.get() || {};
    return ImportedItems.find({
      itemType: ItemTypes.supportTicket,
      dateCreated: {
        $gte: dateRange.start,
        $lt: dateRange.end
      }
    }).count()
  },
  resolvedTicketsCount() {
    let dateRange = Template.instance().dateRange.get() || {};
    return ImportedItems.find({
      itemType: ItemTypes.supportTicket,
      statusHistory: {
        $elemMatch: {
          date: { $gte: dateRange.start, $lte: dateRange.end },
          'to.label': { $regex: 'resolved', $options: 'i' }
        }
      }
    }).count()
  },
  openTicketsCount() {
    return Template.instance().openSupportTickets.get().length
  },
  installationsAffected() {
    let project = this,
      dateRange = Template.instance().dateRange.get() || {},
      supportTickets = Template.instance().supportTickets.get() || [],
      data = _.flatten(supportTickets.map((item) => { return item.document.fields.installationsaffected }));

    return {
      title: 'Installations Affected',
      cssClass: 'chart-flex',
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
      dateRange = Template.instance().dateRange.get() || {},
      supportTickets = Template.instance().supportTickets.get() || [],
      data = _.flatten(supportTickets.map((item) => { return item.document.fields.supportarea }));

    return {
      title: 'Support Areas',
      cssClass: 'chart-flex',
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
      dateRange = Template.instance().dateRange.get() || {},
      supportTickets = Template.instance().openSupportTickets.get() || [],
      linkedItems = Template.instance().linkedItems.get() || [],
      fixIdentifiers = ImportedItems.find({
        identifier: { $in: linkedItems },
        itemType: { $in: [ItemTypes.bug, ItemTypes.feature] }
      }).map((item) => {
        return item.identifier
      }),
      withFixesAges = supportTickets.filter((item) => {
        if (item.document.fields.issuelinks.length) {
          return item.document.fields.issuelinks.reduce((acc, value) => {
            return acc || _.contains(fixIdentifiers, (value.outwardIssue || value.inwardIssue).key)
          }, false)
        }
        return false
      })
        .map((item) => { return moment().diff(moment(item.dateCreated), 'days') }),
      withoutFixesAges = supportTickets.filter((item) => {
        if (item.document.fields.issuelinks.length) {
          return !item.document.fields.issuelinks.reduce((acc, value) => {
            return acc || _.contains(fixIdentifiers, (value.outwardIssue || value.inwardIssue).key)
          }, false)
        }
        return true
      })
        .map((item) => { return moment().diff(moment(item.dateCreated), 'days') }),
      withFixesData = segments.map((floor, i) => {
        let ceiling = i < segments.length - 1 ? segments[i + 1] : 10000;
        return {
          title: i < segments.length - 1 ? floor.toString() + ' - ' + ceiling.toString() : floor.toString() + '+',
          value: withFixesAges.filter((dataPoint) => { return dataPoint >= floor && dataPoint < ceiling })
        }
      }),
      withoutFixesData = segments.map((floor, i) => {
        let ceiling = i < segments.length - 1 ? segments[i + 1] : 10000;
        return {
          title: i < segments.length - 1 ? floor.toString() + ' - ' + ceiling.toString() : floor.toString() + '+',
          value: withoutFixesAges.filter((dataPoint) => { return dataPoint >= floor && dataPoint < ceiling })
        }
      });

    return {
      title: 'Open Ticket Age',
      cssClass: 'chart-flex',
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
              categories: withFixesData.map((d) => { return d.title + ' days' })
            }
          },
          legend: {
            show: true
          }
        }
      },
      data: [
        ['With Fixes'].concat(withFixesData.map((d) => { return d.value.length })),
        ['Without Fixes'].concat(withoutFixesData.map((d) => { return d.value.length }))
      ]
    }
  },
  openTicketsDonut() {
    let project = this,
      dateRange = Template.instance().dateRange.get() || {},
      supportTickets = Template.instance().openSupportTickets.get() || [],
      linkedItems = Template.instance().linkedItems.get() || [],
      fixIdentifiers = ImportedItems.find({
        identifier: { $in: linkedItems },
        itemType: { $in: [ItemTypes.bug, ItemTypes.feature] }
      }).map((item) => {
        return item.identifier
      }),
      data = supportTickets.map((item) => {
        let hasFix = false;
        if (item.document.fields.issuelinks.length) {
          hasFix = item.document.fields.issuelinks.reduce((acc, value) => {
            return acc || _.contains(fixIdentifiers, (value.outwardIssue || value.inwardIssue).key)
          }, false);
        }

        return hasFix ? 'With Fix' : 'Without Fix'
      });

    return {
      title: 'Open Tickets',
      cssClass: 'chart-flex',
      config: {
        callouts: {
          show: true,
          align: false
        },
        chart: {
          donut: {
            title: { text: ['Open Tickets'], showTotal: true },
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
  fixVersions() {
    let project = this,
      dateRange = Template.instance().dateRange.get() || {},
      supportTickets = Template.instance().supportTickets.get() || [],
      linkedItems = Template.instance().linkedItems.get() || [],
      fixVersions = _.flatten(linkedItems.map((itemKey) => {
        let item = ImportedItems.findOne({ 'identifier': itemKey });
        if (item && item.document.fields.fixVersions) {
          return item.document.fields.fixVersions
        }
      }).filter((item) => { return item !== undefined }));

    return {
      title: 'Scheduled Fixes',
      cssClass: 'chart-flex',
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
  },
  openTicketsTable() {
    return Template.instance().openSupportTickets.get();
  },
  fixVersionsTable() {
    let linkedItems = Template.instance().linkedItems.get() || [];
    return ImportedItems.find({
      identifier: { $in: linkedItems },
      itemType: { $in: [ItemTypes.bug, ItemTypes.feature] }
    }, { sort: { dateCreated: 1 } })
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
  instance.openSupportTickets = new ReactiveVar([]);
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


    instance.subscribe('imported_item_crumb_query', { projectId: projectId });
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
      })).filter((item) => { return item !== undefined });

    instance.supportTickets.set(supportTickets);
    instance.linkedItems.set(linkedItems);
    instance.openSupportTickets.set(ImportedItems.find({
      projectId: projectId,
      itemType: ItemTypes.supportTicket,
      statusLabel: { $not: /resolved/i }
    }, { sort: { dateCreated: 1 } }).fetch());

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
