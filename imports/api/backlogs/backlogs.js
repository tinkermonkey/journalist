import { Mongo }         from 'meteor/mongo';
import SimpleSchema      from 'simpl-schema';
import { Util }          from '../util.js';
import { SchemaHelpers } from '../schema_helpers.js';
import { Projects }      from '../projects/projects';

/**
 * ============================================================================
 * Backlogs
 * ============================================================================
 */
export const Backlog = new SimpleSchema({
  title         : {
    type: String
  },
  projectIds    : {
    type    : Array,
    optional: true
  },
  'projectIds.$': {
    type: String
  },
  isPublic      : {
    type        : Boolean,
    defaultValue: false
  },
  // Standard tracking fields
  dateCreated   : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateCreated
  },
  createdBy     : {
    type     : String,
    autoValue: SchemaHelpers.autoValueCreatedBy
  },
  dateModified  : {
    type     : Date,
    autoValue: SchemaHelpers.autoValueDateModified
  },
  modifiedBy    : {
    type     : String,
    autoValue: SchemaHelpers.autoValueModifiedBy
  }
});

export const Backlogs = new Mongo.Collection("backlogs");
Backlogs.attachSchema(Backlog);
ChangeTracker.trackChanges(Backlogs, 'Backlogs');

// These are server side only
Backlogs.deny({
  remove () {
    return true;
  },
  insert () {
    return true;
  },
  update () {
    return true;
  }
});

/**
 * Helpers
 */
Backlogs.helpers({
  
  /**
   * Get the list of projects that are not part of another backlog and should be shown in the projects selector
   */
  availableProjectsIds () {
    let backlog            = this,
        selectedProjects   = backlog.projectIds || [],
        backloggedProjects = _.flatten(Backlogs.find({ isActive: true, _id: { $ne: backlog._id } }).map((existingBacklog) => {
          return existingBacklog.projectIds || []
        })),
        allProjects        = Projects.find({}).map((project) => {
          return project._id
        });
    
    return _.union(selectedProjects, _.difference(allProjects, backloggedProjects))
  },
  
  /**
   * Handy helper for getting all of the projects
   */
  availableProjectsQuery () {
    let backlog = this;
    
    return {
      _id: { $in: backlog.availableProjectsIds() }
    }
  },
  
});