import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { DisplayTemplates } from './display_templates';

/**
 * ============================================================================
 * DisplayTemplateGroups
 * ============================================================================
 */
export const DisplayTemplateGroup = new SimpleSchema({
  title      : {
    type: String
  },
  parentGroup: {
    type    : String,
    optional: true
  }
});

export const DisplayTemplateGroups = new Mongo.Collection("display_template_groups");
DisplayTemplateGroups.attachSchema(DisplayTemplateGroup);

/**
 * Helpers
 */
DisplayTemplateGroups.helpers({
  childGroups () {
    return DisplayTemplateGroups.find({ parentGroup: this._id }, { sort: { title: 1 } })
  },
  childTemplates () {
    return DisplayTemplates.find({ parentGroup: this._id }, { sort: { templateName: 1 } })
  },
  childCount () {
    let childGroups    = this.childGroups(),
        deepChildCount = childGroups.fetch().reduce((acc, childGroup) => {
          return acc + childGroup.childCount()
        }, childGroups.count());
    return deepChildCount + this.childTemplates().count()
  },
  parent () {
    if (this.parentGroup) {
      return DisplayTemplateGroups.findOne({ _id: this.parentGroup })
    }
  },
  parentList () {
    return _.flatten([ this.parent() ].concat(this.parent() && this.parent().parentList()))
        .filter((g) => {
          return g && g.title
        })
  },
  path (joinString) {
    return [ this.title ].concat(this.parentList().map((g) => {
      return g.title
    })).reverse().join(joinString || ' - ')
  },
  treeNodes () {
    let self = this;
    return {
      text        : self.title,
      href        : FlowRouter.path('DisplayTemplateGroup', { groupId: self._id }),
      customId    : self._id,
      icon        : 'glyphicon glyphicon-folder-close',
      selectedIcon: 'glyphicon glyphicon-folder-open',
      state       : {
        expanded: false
      },
      tags        : [
        self.childCount()
      ],
      nodes       : self.childGroups().map((group) => {
        return group.treeNodes()
      }).concat(self.childTemplates().map((template) => {
        return {
          text    : template.templateName,
          href    : FlowRouter.path('DisplayTemplate', { templateId: template._id }),
          customId: template._id
        }
      }))
    }
  }
});