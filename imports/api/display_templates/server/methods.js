import { Meteor }                    from 'meteor/meteor';
import { check, Match }              from 'meteor/check';
import { logger }                    from 'meteor/austinsand:journalist-logger';
import { Auth }                      from '../../auth';
import { DisplayTemplates }          from '../display_templates';
import { DisplayTemplateGroups }     from '../display_template_groups';
import { PublishedDisplayTemplates } from '../published_display_templates';

Meteor.methods({
  /**
   * Add an integration display template
   * @param templateName
   * @param parentGroup (optional)
   */
  addDisplayTemplate (templateName, parentGroup) {
    logger.info('addDisplayTemplate:', templateName, parentGroup);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(templateName, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      let payload = {
        templateName  : templateName,
        currentVersion: 0
      };
      
      if (parentGroup) {
        payload.parentGroup = parentGroup
      }
      
      // Insert the project percent
      DisplayTemplates.insert(payload);
    } else {
      logger.error('Non-admin user tried to add an integration display template:', user.username, templateName);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove an integration display template
   * @param templateId
   */
  deleteDisplayTemplate (templateId) {
    logger.info('deleteDisplayTemplate:', templateId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(templateId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      DisplayTemplates.remove(templateId);
    } else {
      logger.error('Non-admin user tried to delete an integration display template:', user.username, templateId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit an integration display template record
   * @param templateId
   * @param key
   * @param value
   */
  editDisplayTemplate (templateId, key, value) {
    logger.info('editDisplayTemplate:', templateId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(templateId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the display template record to make sure this is authorized
    let displayTemplate = DisplayTemplates.findOne(templateId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (displayTemplate) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        DisplayTemplates.update(templateId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      logger.error('Non-admin user tried to edit an integration display template:', user.username, key, templateId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Publish a template ID so that users can use it
   * @param {*} templateId
   */
  publishIntegrationDisplayTemplate (templateId) {
    logger.info('publishIntegrationDisplayTemplate:', templateId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(templateId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      let displayTemplate = DisplayTemplates.findOne(templateId);
      if (displayTemplate) {
        PublishedDisplayTemplates.upsert({ _id: displayTemplate._id }, { $set: displayTemplate });
        DisplayTemplates.update(templateId, {
          $set: {
            lastPublished   : Date.now(),
            publishedVersion: displayTemplate.currentVersion || 0,
            currentVersion  : displayTemplate.currentVersion // Maintain the current version
          }
        })
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      logger.error('Non-admin user tried to delete an integration display template:', user.username, templateId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Add an integration display template group
   * @param title
   * @param parentGroup (optional)
   */
  addDisplayTemplateGroup (title, parentGroup) {
    logger.info('addDisplayTemplateGroup:', title, parentGroup);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(title, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      let payload = {
        title: title,
      };
      
      if (parentGroup) {
        payload.parentGroup = parentGroup
      }
      
      // Insert the project percent
      DisplayTemplateGroups.insert(payload);
    } else {
      logger.error('Non-admin user tried to add an integration display template group:', user.username, title);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Remove an integration display template group
   * @param groupId
   */
  deleteDisplayTemplateGroup (groupId) {
    logger.info('deleteDisplayTemplateGroup:', groupId);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(groupId, String);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      DisplayTemplateGroups.remove(groupId);
      
      // Remove this groupId from everything using it, so they go back to the parentless group
      DisplayTemplates.update({ parentGroup: groupId }, { $unset: { parentGroup: true } });
      DisplayTemplateGroups.update({ parentGroup: groupId }, { $unset: { parentGroup: true } });
    } else {
      logger.error('Non-admin user tried to delete an integration display template group:', user.username, groupId);
      throw new Meteor.Error(403);
    }
  },
  
  /**
   * Edit an integration display template group record
   * @param groupId
   * @param key
   * @param value
   */
  editDisplayTemplateGroup (groupId, key, value) {
    logger.info('editDisplayTemplateGroup:', groupId, key);
    let user = Auth.requireAuthentication();
    
    // Validate the data is complete
    check(groupId, String);
    check(key, String);
    check(value, Match.Any);
    
    // Get the display template group record to make sure this is authorized
    let displayTemplate = DisplayTemplateGroups.findOne(groupId);
    
    // Validate that the current user is an administrator
    if (user.isAdmin()) {
      if (displayTemplate) {
        let update    = {};
        update[ key ] = value;
        
        // Update the contributor
        DisplayTemplateGroups.update(groupId, { $set: update });
      } else {
        throw new Meteor.Error(404);
      }
    } else {
      logger.error('Non-admin user tried to edit an integration display template group:', user.username, key, groupId);
      throw new Meteor.Error(403);
    }
  },
});
