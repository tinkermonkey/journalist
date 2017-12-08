import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { later } from 'meteor/mrt:later';
import { StatusReports } from '../status_reports.js';
import { StatusReportSettings } from '../status_report_settings.js';
import { StatusReportStates } from '../status_report_states.js';
import { Auth } from '../../auth.js';

Meteor.methods({
  /**
   * Create a new statusReport
   * @param contributorId {String}
   * @param sourceCollection {String}
   * @param sourceId {String}
   * @param state {StatusReportStates}
   * @param dueDate {Date}
   */
  addStatusReport (contributorId, sourceCollection, sourceId, state, dueDate) {
    console.log('addStatusReport:', contributorId, sourceCollection, sourceId, state, dueDate);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(contributorId, String);
    check(sourceCollection, String);
    check(sourceId, String);
    check(state, Number);
    check(dueDate, Date);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(contributorId) || user.isAdmin() || user.contributorId === contributorId) {
      // Create the statusReport
      let reportId = StatusReports.insert({
        contributorId   : contributorId,
        sourceCollection: sourceCollection,
        sourceId        : sourceId,
        state           : state,
        dueDate         : dueDate
      });
      
      // Update the nextDue date for any settings that this is related to
      try {
        let reportSetting = StatusReportSettings.findOne({
          contributorId   : contributorId,
          sourceCollection: sourceCollection,
          sourceId        : sourceId
        });
        if (reportSetting) {
          // Calculate the next due date after the due date provided for this report
          let nextDue = later.schedule(later.parse.text(reportSetting.laterDirective)).next(1, dueDate);
          StatusReportSettings.update({ _id: reportSetting._id }, { $set: { nextDue: nextDue } });
        }
      } catch (e) {
        console.error('addStatusReport failed to calculate the nextDue data:', contributorId, sourceCollection, sourceId, e);
      }
      
      return { reportId: reportId }
    } else {
      console.error('Non-authorized user tried to add a statusReport:', user.username, sourceCollection, sourceId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a statusReport record
   * @param statusReportId
   * @param key
   * @param value
   */
  editStatusReport (statusReportId, key, value) {
    console.log('editStatusReport:', statusReportId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(statusReportId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Load the statusReport to authorize the edit
    let statusReport = StatusReports.findOne(statusReportId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(statusReport.contributorId) || user.isAdmin() || user.contributorId === statusReport.contributorId) {
      let update    = {};
      update[ key ] = value;
      
      // Make sure it's in a state to be edited
      if (statusReport.state !== StatusReportStates.submitted && statusReport.state !== StatusReportStates.expired) {
        // Update the statusReport
        StatusReports.update(statusReportId, { $set: update });
      } else {
        console.error('User tried to edit a terminal state statusReport:', user.username, key, value);
        throw new Meteor.Error(403);
      }
    } else {
      console.error('Non-authorized user tried to edit a statusReport:', user.username, key, value);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Delete a statusReport record
   * @param statusReportId
   */
  deleteStatusReport (statusReportId) {
    console.log('deleteStatusReport:', statusReportId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(statusReportId, String);
    
    // Load the statusReport to authorize the edit
    let statusReport = StatusReports.findOne(statusReportId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(statusReport.contributorId) || user.isAdmin()) {
      // Delete the statusReport
      StatusReports.remove(statusReportId);
    } else {
      console.error('Non-authorized user tried to delete a statusReport:', user.username, statusReportId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Submit a statusReport record
   * @param statusReportId
   */
  submitStatusReport (statusReportId) {
    console.log('submitStatusReport:', statusReportId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(statusReportId, String);
    
    // Load the statusReport to authorize the edit
    let statusReport = StatusReports.findOne(statusReportId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(statusReport.contributorId) || user.isAdmin() || user.contributorId === statusReport.contributorId) {
      // Delete the statusReport
      StatusReports.update(statusReportId, {
        $set: {
          state     : StatusReportStates.submitted,
          submitDate: Date.now()
        }
      });
    } else {
      console.error('Non-authorized user tried to submit a statusReport:', user.username, statusReportId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Reopen a statusReport record
   * @param statusReportId
   */
  reopenStatusReport (statusReportId) {
    console.log('reopenStatusReport:', statusReportId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(statusReportId, String);
    
    // Load the statusReport to authorize the edit
    let statusReport = StatusReports.findOne(statusReportId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(statusReport.contributorId) || user.isAdmin()) {
      // Delete the statusReport
      StatusReports.update(statusReportId, {
        $set  : {
          state: StatusReportStates.inProgress
        },
        $unset: {
          submitDate: true
        }
      });
    } else {
      console.error('Non-authorized user tried to reopen a statusReport:', user.username, statusReportId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Create a new statusReportSetting
   * @param contributorId
   * @param sourceCollection
   * @param sourceId
   */
  addStatusReportSetting (contributorId, sourceCollection, sourceId) {
    console.log('addStatusReportSetting:', contributorId, sourceCollection, sourceId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(contributorId, String);
    check(sourceCollection, String);
    check(sourceId, String);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(contributorId) || user.isAdmin()) {
      // Create the statusReportSetting
      let settingId = StatusReportSettings.insert({
        contributorId   : contributorId,
        sourceCollection: sourceCollection,
        sourceId        : sourceId,
        startDate       : new Date()
      });
      
      // Set the first due date
      let setting = StatusReportSettings.findOne(settingId),
          nextDue = later.schedule(later.parse.text(setting.laterDirective)).next(1, setting.startDate);
      
      StatusReportSettings.update(settingId, { $set: { nextDue: nextDue } });
    } else {
      console.error('Non-authorized user tried to add a statusReportSetting:', user.username, sourceCollection, sourceId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit a statusReportSetting record
   * @param statusReportSettingId
   * @param key
   * @param value
   */
  editStatusReportSetting (statusReportSettingId, key, value) {
    console.log('editStatusReportSetting:', statusReportSettingId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(statusReportSettingId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Load the statusReportSetting to authorize the edit
    let statusReportSetting = StatusReportSettings.findOne(statusReportSettingId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(statusReportSetting.contributorId) || user.isAdmin()) {
      let update    = {};
      update[ key ] = value;
      
      // Update the statusReportSetting
      StatusReportSettings.update(statusReportSettingId, { $set: update });
    } else {
      console.error('Non-admin user tried to edit a statusReportSetting:', user.username, key, value);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Delete a statusReportSetting record
   * @param statusReportSettingId
   */
  deleteStatusReportSetting (statusReportSettingId) {
    console.log('deleteStatusReportSetting:', statusReportSettingId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(statusReportSettingId, String);
    
    // Load the statusReportSetting to authorize the edit
    let statusReportSetting = StatusReportSettings.findOne(statusReportSettingId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(statusReportSetting.contributorId) || user.isAdmin()) {
      // Delete the statusReportSetting
      StatusReportSettings.remove(statusReportSettingId);
    } else {
      console.error('Non-authorized user tried to delete a statusReportSetting:', user.username, statusReportSettingId);
      throw new Meteor.Error(403);
    }
  },
});
