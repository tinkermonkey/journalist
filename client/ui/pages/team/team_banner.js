import './team_banner.html';
import { Template } from 'meteor/templating';

/**
 * Template Helpers
 */
Template.TeamBanner.helpers({
  teamBannerTemplate () {
    let team = this;
    return team.bannerTemplate || 'DevTeamBanner'
  }
});

/**
 * Template Event Handlers
 */
Template.TeamBanner.events({});

/**
 * Template Created
 */
Template.TeamBanner.onCreated(() => {

});

/**
 * Template Rendered
 */
Template.TeamBanner.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.TeamBanner.onDestroyed(() => {
  
});
