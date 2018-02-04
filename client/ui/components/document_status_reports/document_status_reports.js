import './document_status_reports.html';
import { Template }           from 'meteor/templating';
import { RobaDialog }         from 'meteor/austinsand:roba-dialog';
import { Efforts }            from '../../../../imports/api/efforts/efforts';
import { Tasks }              from '../../../../imports/api/tasks/tasks';
import { StatusReportStates } from '../../../../imports/api/status_reports/status_report_states';
import './status_report_settings';
import './incomplete_reports';
import './recent_reports';
import './edit_report_form';

// Mapping of sourceCollections to edit methods
let editMethods      = {
      Tasks  : 'editTask',
      Efforts: 'editEffort'
    },
    collections      = {
      Tasks  : Tasks,
      Efforts: Efforts
    },
    completeableDocs = [
      'Tasks',
      'Efforts'
    ];

/**
 * Template Helpers
 */
Template.DocumentStatusReports.helpers({
  canBeCompleted () {
    return _.contains(completeableDocs, this.sourceCollection);
  },
  documentIsComplete () {
    let context = this;
    
    if (context.sourceCollection && context.sourceId) {
      let doc = collections[ context.sourceCollection ].findOne(context.sourceId);
      return doc.complete
    }
  },
  canFileReport () {
    let currentContributor = Meteor.user().contributor();
    return this.contributorId === currentContributor._id || currentContributor.managesContributor(this.contributorId)
  }
});

/**
 * Template Event Handlers
 */
Template.DocumentStatusReports.events({
  'click .btn-complete-document' (e, instance) {
    let context = instance.data;
    
    if (context.sourceCollection && context.sourceId) {
      let canBeComplete = _.contains(completeableDocs, context.sourceCollection),
          editMethod    = editMethods[ context.sourceCollection ];
      if (canBeComplete && editMethod) {
        console.log('Calling', editMethod, 'for document', context.sourceId);
        Meteor.call(editMethod, context.sourceId, 'complete', true, (error, response) => {
          if (error) {
            RobaDialog.error('Update failed:' + error.toString());
          }
        });
      }
    }
  },
  'click .btn-reopen-document' (e, instance) {
    let context = instance.data;
    
    if (context.sourceCollection && context.sourceId) {
      let canBeComplete = _.contains(completeableDocs, context.sourceCollection),
          editMethod    = editMethods[ context.sourceCollection ];
      if (canBeComplete && editMethod) {
        console.log('Calling', editMethod, 'for document', context.sourceId);
        Meteor.call(editMethod, context.sourceId, 'complete', false, (error, response) => {
          if (error) {
            RobaDialog.error('Update failed:' + error.toString());
          }
        });
      }
    }
  },
  'click .btn-file-report' (e, instance) {
    let context            = instance.data,
        currentContributor = Meteor.user().contributor(),
        canFileReport      = context.contributorId === currentContributor._id || currentContributor.managesContributor(context.contributorId);
    
    if (canFileReport && context.sourceCollection && context.sourceId) {
      // Create a new report
      Meteor.call('addStatusReport', currentContributor._id, context.sourceCollection, context.sourceId, StatusReportStates.inProgress, context.nextDue, (error, response) => {
        if (error) {
          RobaDialog.error('Adding report failed:' + error.toString());
        } else {
          // Hide the File Report link
          instance.$('.btn-file-report').hide();
          
          // Render the edit form to the form container
          Blaze.renderWithData(Template.EditReportForm, { reportId: response.reportId }, instance.$('.report-form-container').get(0))
        }
      });
    }
  }
});

/**
 * Template Created
 */
Template.DocumentStatusReports.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.DocumentStatusReports.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.DocumentStatusReports.onDestroyed(() => {
  
});
