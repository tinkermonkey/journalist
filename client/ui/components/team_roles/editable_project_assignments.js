import './editable_project_assignments.html';
import { Template }                      from 'meteor/templating';
import { RobaDialog }                    from 'meteor/austinsand:roba-dialog';
import { Contributors }                  from '../../../../imports/api/contributors/contributors';
import { ContributorProjectAssignments } from '../../../../imports/api/contributors/contributor_project_assignments';
import './add_assignment_form.js';

/**
 * Template Helpers
 */
Template.EditableProjectAssignments.helpers({
  hasCapacity () {
    let contributor = Contributors.findOne(this.contributorId);
    return contributor.hasCapacity()
  }
});

/**
 * Template Event Handlers
 */
Template.EditableProjectAssignments.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let assignmentId = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey      = $(e.target).attr('data-key');
    
    console.log('EditableProjectAssignments edited:', assignmentId, dataKey, newValue);
    if (assignmentId !== null && dataKey !== null) {
      // Create the project
      Meteor.call('editContributorProjectAssignment', assignmentId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Failed to edit project assignment:' + error.toString())
        } else {
          RobaDialog.hide();
        }
      });
    }
  },
  'click .btn-add-project-assignment' (e, instance) {
    e.stopImmediatePropagation();
    
    let contributorId = $(e.target).closest('.editable-project-assignments').attr('data-contributor-id'),
        teamRoleId    = $(e.target).closest('.editable-project-assignments').attr('data-pk');
    
    RobaDialog.show({
      contentTemplate: 'AddAssignmentForm',
      title          : 'Add Project Assignment',
      width          : 500,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Add' }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = 'serverMethodForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the project
            Meteor.call('addContributorProjectAssignment', contributorId, teamRoleId, formData.projectId, formData.percent, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create project assignment:' + error.toString())
              } else {
                RobaDialog.hide();
              }
            });
            
            AutoForm.resetForm(formId)
          }
        } else {
          RobaDialog.hide();
        }
      }.bind(this)
    });
  },
  'click .btn-delete-assignment' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let contributorId = $(e.target).closest('.editable-project-assignments').attr('data-contributor-id'),
        assignmentId  = $(e.target).closest('.data-table-row').attr('data-pk'),
        contributor   = Contributors.findOne(contributorId),
        assignment    = ContributorProjectAssignments.findOne(assignmentId);
    
    RobaDialog.ask('Delete Project Assignment?', 'Are you sure that you want to delete the role of <span class="label label-primary"> ' +
        contributor.name + '</span> on the <span class="label label-primary"> ' + assignment.project().title + '</span> project?', () => {
      RobaDialog.hide();
      Meteor.call('deleteContributorProjectAssignment', assignmentId, function (error, response) {
        if (error) {
          RobaDialog.error('Delete failed: ' + error.message);
        }
      });
    });
  }
});

/**
 * Template Created
 */
Template.EditableProjectAssignments.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.EditableProjectAssignments.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.EditableProjectAssignments.onDestroyed(() => {
  
});
