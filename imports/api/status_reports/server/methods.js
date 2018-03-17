import { Meteor }               from 'meteor/meteor';
import { check, Match }         from 'meteor/check';
import { later }                from 'meteor/mrt:later';
import { logger }               from 'meteor/austinsand:journalist-logger';
import { StatusReports }        from '../status_reports.js';
import { StatusReportSettings } from '../status_report_settings.js';
import { StatusReportStates }   from '../status_report_states.js';
import { Auth }                 from '../../auth.js';

Meteor.methods({
  /**
   * Create a new statusReport
   * @param contributorId {String}
   * @param sourceCollection {String}
   * @param sourceId {String}
   * @param state {StatusReportStates}
   * @param dueDate {Date} (optional)
   */
  addStatusReport (contributorId, sourceCollection, sourceId, state, dueDate) {
    logger.info('addStatusReport:', contributorId, sourceCollection, sourceId, state, dueDate);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(contributorId, String);
    check(sourceCollection, String);
    check(sourceId, String);
    check(state, Number);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(contributorId) || user.isAdmin() || user.contributorId() === contributorId) {
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
        logger.error('addStatusReport failed to calculate the nextDue data:', contributorId, sourceCollection, sourceId, e);
      }
      
      return { reportId: reportId }
    } else {
      logger.error('Non-authorized user tried to add a statusReport:', user.contributorId(), contributorId, user.username, sourceCollection, sourceId);
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
    logger.info('editStatusReport:', statusReportId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(statusReportId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Load the statusReport to authorize the edit
    let statusReport = StatusReports.findOne(statusReportId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(statusReport.contributorId) || user.isAdmin() || user.contributorId() === statusReport.contributorId) {
      let update    = {};
      update[ key ] = value;
      
      // Make sure it's in a state to be edited
      if (statusReport.state !== StatusReportStates.submitted && statusReport.state !== StatusReportStates.expired) {
        // Update the statusReport
        StatusReports.update(statusReportId, { $set: update });
      } else {
        logger.error('User tried to edit a terminal state statusReport:', user.username, key, value);
        throw new Meteor.Error(403);
      }
    } else {
      logger.error('Non-authorized user tried to edit a statusReport:', user.username, key, value);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Delete a statusReport record
   * @param statusReportId
   */
  deleteStatusReport (statusReportId) {
    logger.info('deleteStatusReport:', statusReportId);
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
      logger.error('Non-authorized user tried to delete a statusReport:', user.username, statusReportId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Submit a statusReport record
   * @param statusReportId
   */
  submitStatusReport (statusReportId) {
    logger.info('submitStatusReport:', statusReportId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(statusReportId, String);
    
    // Load the statusReport to authorize the edit
    let statusReport = StatusReports.findOne(statusReportId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(statusReport.contributorId) || user.isAdmin() || user.contributorId() === statusReport.contributorId) {
      // Mark the report submitted
      StatusReports.update(statusReportId, {
        $set: {
          state     : StatusReportStates.submitted,
          submitDate: Date.now()
        }
      });
      
      // Find any settings for this context and make sure they get updated
      let setting = StatusReportSettings.findOne({});
      if (setting) {
      
      }
    } else {
      logger.error('Non-authorized user tried to submit a statusReport:', user.username, statusReportId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Reopen a statusReport record
   * @param statusReportId
   */
  reopenStatusReport (statusReportId) {
    logger.info('reopenStatusReport:', statusReportId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(statusReportId, String);
    
    // Load the statusReport to authorize the edit
    let statusReport = StatusReports.findOne(statusReportId);
    
    // Validate that the current user is an administrator
    if (user.managesContributor(statusReport.contributorId) || user.isAdmin() || statusReport.contributorId === user.contributor()._id) {
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
      logger.error('Non-authorized user tried to reopen a statusReport:', user.username, statusReportId);
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
    logger.info('addStatusReportSetting:', contributorId, sourceCollection, sourceId);
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
      let setting = StatusReportSettings.findOne(settingId);
      setting.updateNextDue();
    } else {
      logger.error('Non-authorized user tried to add a statusReportSetting:', user.username, sourceCollection, sourceId);
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
    logger.info('editStatusReportSetting:', statusReportSettingId, key);
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
      logger.error('Non-admin user tried to edit a statusReportSetting:', user.username, key, value);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Delete a statusReportSetting record
   * @param statusReportSettingId
   */
  deleteStatusReportSetting (statusReportSettingId) {
    logger.info('deleteStatusReportSetting:', statusReportSettingId);
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
      logger.error('Non-authorized user tried to delete a statusReportSetting:', user.username, statusReportSettingId);
      throw new Meteor.Error(403);
    }
  },
});
