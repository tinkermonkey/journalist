import './display_templates.html';
import { Template }              from 'meteor/templating';
import SimpleSchema              from 'simpl-schema';
import { RobaDialog }            from 'meteor/austinsand:roba-dialog';
import { DisplayTemplates }      from '../../../../../imports/api/display_templates/display_templates';
import { DisplayTemplateGroups } from '../../../../../imports/api/display_templates/display_template_groups';
import '../integration_servers/integration_server_field_reference';
import '../../../components/bootstrap-treeview/bootstrap-treeview';
import './display_template';
import './display_template_list';

/**
 * Template Helpers
 */
Template.DisplayTemplates.helpers({
  displayTemplates () {
    let groupId = FlowRouter.getParam('groupId');
    return DisplayTemplates.find({ parentGroup: groupId }, { sort: { templateName: 1 } })
  },
  currentGroup () {
    let groupId = FlowRouter.getParam('groupId');
    if (groupId) {
      return DisplayTemplateGroups.findOne(groupId);
    }
  },
  currentTemplate () {
    let templateId = FlowRouter.getParam('templateId');
    if (templateId) {
      return DisplayTemplates.findOne(templateId)
    }
  },
  unplublishedTemplates () {
    return DisplayTemplates.find({ $where: "this.currentVersion > this.publishedVersion" }, { sort: { templateName: 1 } })
  },
  orphanedTemplates () {
    return DisplayTemplates.find({ parentGroup: { $exists: false } }, { sort: { templateName: 1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.DisplayTemplates.events({
  'edited .editable' (e, instance, newValue) {
    e.stopImmediatePropagation();
    
    let displayTemplateId = $(e.target).closest('.data-table-row').attr('data-pk'),
        dataKey           = $(e.target).attr('data-key');
    
    console.log('edited:', displayTemplateId, dataKey, newValue);
    if (displayTemplateId && dataKey) {
      Meteor.call('editDisplayTemplate', displayTemplateId, dataKey, newValue, (error, response) => {
        if (error) {
          RobaDialog.error('Update failed:' + error.toString());
        }
      });
    }
  },
  'click .btn-add-display-template' (e, instance) {
    let parentGroup = FlowRouter.getParam('groupId');
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          templateName: {
            type : String,
            label: 'Template Name',
            regEx: /^[\w\d]+$/i
          }
        })
      },
      title          : 'Add Display Template',
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
            
            // Create the display template
            Meteor.call('addDisplayTemplate', formData.templateName, parentGroup, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create display template:' + error.toString())
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
  'click .btn-add-group' (e, instance) {
    let parentGroup = FlowRouter.getParam('groupId');
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type : String,
            label: 'Group Name'
          }
        })
      },
      title          : 'Add Display Template Group',
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
            
            // Create the display template
            Meteor.call('addDisplayTemplateGroup', formData.title, parentGroup, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create display template group:' + error.toString())
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
  'click .btn-move-template' (e, instance) {
    let displayTemplate = this;
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          parentGroup: {
            type    : String,
            label   : 'New Group',
            autoform: {
              options: DisplayTemplateGroups.find({}).map((g) => {
                return { label: g.path(), value: g._id }
              }).sort((a, b) => {
                return a.label > b.label
              })
            }
          }
        })
      },
      title          : 'Move Display Template',
      width          : 500,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Move' }
      ],
      callback       : function (btn) {
        if (btn.match(/move/i)) {
          let formId = 'addRecordForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the display template
            Meteor.call('editDisplayTemplate', displayTemplate._id, 'parentGroup', formData.parentGroup, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to create display template group:' + error.toString())
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
  'click .btn-delete-display-template' (e, instance) {
    let displayTemplate = this;
    
    RobaDialog.ask('Delete Template?', 'Are you sure that you want to delete the display template <span class="label label-primary"> ' + displayTemplate.templateName + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteDisplayTemplate', displayTemplate._id, function (error, response) {
        if (error) {
          RobaDialog.error('Delete failed: ' + error.message);
        }
      });
    });
  },
  'click .btn-edit-group' () {
    let groupId = FlowRouter.getParam('groupId'),
        group   = DisplayTemplateGroups.findOne(groupId);
    
    RobaDialog.show({
      contentTemplate: 'AddRecordForm',
      contentData    : {
        schema: new SimpleSchema({
          title: {
            type        : String,
            label       : 'Group Title',
            defaultValue: group.title
          }
        })
      },
      title          : 'Edit Group Title',
      width          : 500,
      buttons        : [
        { text: 'Cancel' },
        { text: 'Save' }
      ],
      callback       : function (btn) {
        if (btn.match(/save/i)) {
          let formId = 'addRecordForm';
          if (AutoForm.validateForm(formId)) {
            let formData = AutoForm.getFormValues(formId).insertDoc;
            
            // Create the display template
            Meteor.call('editDisplayTemplateGroup', groupId, 'title', formData.title, (error, response) => {
              if (error) {
                RobaDialog.error('Failed to update display template group:' + error.toString())
              } else {
                RobaDialog.hide();
              }
              AutoForm.resetForm(formId)
            });
          }
        } else {
          RobaDialog.hide();
        }
      }.bind(this)
    });
  },
  'click .btn-delete-group' (e, instance) {
    let group  = this,
        parent = group.parent();
    
    RobaDialog.ask('Delete Group?', 'Are you sure that you want to delete the template group <span class="label label-primary">' + group.title + '</span> ?', () => {
      RobaDialog.hide();
      Meteor.call('deleteDisplayTemplateGroup', group._id, function (error, response) {
        if (error) {
          RobaDialog.error('Delete failed: ' + error.message);
        } else {
          if (parent) {
            FlowRouter.go(FlowRouter.path('DisplayTemplateGroup', { groupId: parent._id }))
          } else {
            FlowRouter.go(FlowRouter.path('DisplayTemplates'))
          }
        }
      });
    });
  },
  'click .btn-export-templates' (e, instance) {
    Meteor.call('exportData', [ 'DisplayTemplates', 'DisplayTemplateGroups', 'PublishedDisplayTemplates' ], function (error, response) {
      if (error) {
        RobaDialog.error('Export failed: ' + error.toString());
      } else {
        let a = window.document.createElement('a');
        
        a.setAttribute('href', '/export/' + response);
        a.setAttribute('target', '_blank');
        a.click();
      }
    });
  }
});

/**
 * Template Created
 */
Template.DisplayTemplates.onCreated(() => {
  let instance = Template.instance();
  
  instance.subscribe('display_templates');
  instance.subscribe('display_template_groups');
  
});

/**
 * Template Rendered
 */
Template.DisplayTemplates.onRendered(() => {
  let instance = Template.instance();
  
  instance.autorun(() => {
    // Build up the tree data
    let baseGroups    = DisplayTemplateGroups.find({ parentGroup: null }, { sort: { title: 1 } }).fetch(),
        baseTemplates = DisplayTemplates.find({ parentGroup: null }, { sort: { templateName: 1 } }).fetch(),
        treeData      = baseGroups.map((group) => {
          return group.treeNodes()
        }).concat(baseTemplates.map((template) => {
          return {
            text      : template.templateName,
            href      : FlowRouter.path('DisplayTemplate', { templateId: template._id }),
            selectable: false,
            customId  : template._id
          }
        })),
        groupId       = FlowRouter.getParam('groupId'),
        templateId    = FlowRouter.getParam('templateId'),
        templateName  = FlowRouter.getParam('templateName');
    
    if (templateName) {
      let template = DisplayTemplates.findOne({ templateName: templateName });
      if (template) {
        FlowRouter.go(FlowRouter.path('DisplayTemplate', { templateId: template._id }));
      }
    }
    
    //console.log('DisplayTemplates treeData:', treeData);
    
    instance.$('.treeview-container').treeview({
      levels        : 1,
      injectStyle   : false,
      showTags      : true,
      collapseIcon  : 'glyphicon glyphicon-folder-open',
      expandIcon    : 'glyphicon glyphicon-folder-close',
      nodeIcon      : 'glyphicon glyphicon-file',
      enableLinks   : true,
      data          : treeData,
      onNodeSelected: function (event, data) {
        FlowRouter.go(data.href);
      }
    });
    
    if (groupId) {
      let groupNodeId = instance.$('.treeview-container').treeview('findNodeIdByCustomId', groupId);
      //console.log('Treeview revealing group node:', groupId, groupNodeId);
      
      if (groupNodeId !== undefined) {
        try {
          let groupNode = instance.$('.treeview-container').treeview('getNode', groupNodeId);
          //console.log('Treeview revealing group node:', groupId, groupNode);
          
          instance.$('.treeview-container').treeview('revealNode', [ groupNode ]);
          instance.$('.treeview-container').treeview('expandNode', [ groupNode ]);
          if (!templateId) {
            instance.$('.treeview-container').treeview('selectNode', [ groupNode ]);
          }
        } catch (e) {
          // ignore it, it fails for all top-level items
          //console.log('Problems tending treeview:', e);
        }
      }
    }
    
    if (templateId) {
      let templateNodeId = instance.$('.treeview-container').treeview('findNodeIdByCustomId', templateId);
      //console.log('Treeview selecting template node:', templateId, templateNodeId);
      
      if (templateNodeId !== undefined) {
        try {
          let templateNode = instance.$('.treeview-container').treeview('getNode', templateNodeId);
          //console.log('Treeview revealing template node:', groupId, templateNode);
          instance.$('.treeview-container').treeview('selectNode', [ templateNode ]);
        } catch (e) {
          // ignore it, it fails for all top-level items
          //console.log('Problems tending treeview:', e);
        }
      }
    }
  })
});

/**
 * Template Destroyed
 */
Template.DisplayTemplates.onDestroyed(() => {
  
});
