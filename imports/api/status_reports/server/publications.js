import { Meteor } from 'meteor/meteor';
import { StatusReports } from '../status_reports';
import { StatusReportSettings } from '../status_report_settings';
import { StatusReportStates } from '../status_report_states';

Meteor.publish('status_report_settings', function () {
  console.log('Publish: status_report_settings');
  if (this.userId) {
    let user            = Meteor.user(),
        contributorList = user.contributor().allStaffIds();
    contributorList.push(user.contributor()._id);
    return StatusReportSettings.find({ contributorId: { $in: contributorList } });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('recent_reports', function (sourceCollection, sourceId) {
  console.log('Publish: recent_reports');
  if (this.userId) {
    let user            = Meteor.user(),
        contributorList = user.contributor().allStaffIds();
    contributorList.push(user.contributor()._id);
    return StatusReports.find({
      sourceCollection: sourceCollection,
      sourceId        : sourceId,
      state           : StatusReportStates.submitted,
      contributorId   : { $in: contributorList }
    });
  } else {
    this.ready();
    return [];
  }
});

Meteor.publish('incomplete_reports', function (sourceCollection, sourceId) {
  console.log('Publish: incomplete_reports');
  if (this.userId) {
    let user            = Meteor.user(),
        contributorList = user.contributor().allStaffIds();
    contributorList.push(user.contributor()._id);
    return StatusReports.find({
      sourceCollection: sourceCollection,
      sourceId        : sourceId,
      state           : {$ne: StatusReportStates.submitted },
      contributorId   : { $in: contributorList }
    });
  } else {
    this.ready();
    return [];
  }
});
