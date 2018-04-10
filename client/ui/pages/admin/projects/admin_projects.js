import './admin_projects.html';
import { Template }   from 'meteor/templating';
import SimpleSchema   from 'simpl-schema';
import { RobaDialog } from 'meteor/austinsand:roba-dialog';
import { Projects }   from '../../../../../imports/api/projects/projects.js';
import '../../../components/add_record_form/add_record_form.js';
import './admin_project_home.js';
import './admin_projects_order_list.js';
import '../../../components/editable_color_picker/editable_color_picker';

/**
 * Template Helpers
 */
Template.AdminProjects.helpers({
  projects () {
    return Projects.find({}, { sort: { title: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.AdminProjects.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let projectId = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey   = $(e.target).attr('data-key');
    
    console.log('edited:', projectId, dataKey, newValue);
    if (projectId && dataKey) {
      Meteor.call('editProject', projectId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-add-project' (e, instance) {
    let context = Template.currentData();
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Title'
          }
        })
      },
      title          : 'Add Project',
      width          : 500,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Add' }
      ],
      callback       : function (btn) {
        if (btn.match(/add/i)) {
          let formId = 'addRecordForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the project
            Meteor.call('addProject', formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create project:' + error.toString())
              } else {
                RobaDialog.hide();
              }
            });
            
            AutoForm.resetForm(formId)
          }
          return;
        }
        RobaDialog.hide();
      }.bind(this)
    });
  },
  'click .btn-delete-project' (e, instance) {
    let projectId = $(e.target).closest('.data-table-row').attr('data-pk'),
        project   = Projects.findOne(projectId);
    
    RobaDialog.ask('Delete Project?', 'Are you sure that you want to delete the project <span class="label label-primary"> ' + project.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteProject', projectId, function (error, response) {
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
Template.AdminProjects.onCreated(() => {

});

/**
 * Template Rendered
 */
Template.AdminProjects.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AdminProjects.onDestroyed(() => {
  
});
