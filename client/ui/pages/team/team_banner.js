import './team_banner.html';
import { Template } from 'meteor/templating';
import './team_banners/dev_team_banner';

/**
 * Template Helpers
 */
Template.TeamBanner.helpers({
  teamBannerTemplate(){
    let team = this;
    switch (team.homeBanner){
      default:
        return 'DevTeamBanner'
    }
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
