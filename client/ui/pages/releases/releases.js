import './releases.html';
import './releases.css';
import { Template } from 'meteor/templating';
import { Projects } from '../../../../imports/api/projects/projects';
import { Releases } from '../../../../imports/api/releases/releases';

/**
 * Template Helpers
 */
Template.Releases.helpers({
  dashboardCategories () {
    let categoryTitles = [],
        categories;
    
    Projects.find({ showOnDashboard: true }, { sort: { sortOrder: 1 } }).forEach((project) => {
      if (project.dashboardCategory && !_.contains(categoryTitles, project.dashboardCategory)) {
        categoryTitles.push(project.dashboardCategory);
      }
    });
    
    categories = categoryTitles.map((title) => {
      return { title: title, key: title }
    });
    
    // Add an 'Other' category if needed
    if (Projects.find({ showOnDashboard: true, dashboardCategory: { $exists: false } }).count()) {
      categories.push({ title: 'Other', key: null });
    }
    
    return categories
  },
  dashboardProjects (category) {
    return Projects.find({ showOnDashboard: true, dashboardCategory: { $regex: category.key, $options: 'i' } }, { sort: { sortOrder: 1 } })
  },
  recentReleases () {
    let monthsAgoDate = moment().subtract(12, 'months').toDate();
    return Releases.find({ isReleased: true, releaseDate: { $gte: monthsAgoDate } }, { sort: { releaseDate: -1 } })
  }
});

/**
 * Template Event Handlers
 */
Template.Releases.events({});

/**
 * Template Created
 */
Template.Releases.onCreated(() => {
  
});

/**
 * Template Rendered
 */
Template.Releases.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.Releases.onDestroyed(() => {
  
});
