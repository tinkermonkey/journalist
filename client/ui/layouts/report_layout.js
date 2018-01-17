import './report_layout.html';
import './report_layout.css';
import { Template } from 'meteor/templating';
import './display_template_layer';
import {Util} from '../../../imports/api/util';

/**
 * Template Helpers
 */
Template.ReportLayout.helpers({});

/**
 * Template Event Handlers
 */
Template.ReportLayout.events({});

/**
 * Template Created
 */
Template.ReportLayout.onCreated(() => {
  let instance = Template.instance();
  
  Util.standardSubscriptions(instance);
});

/**
 * Template Rendered
 */
Template.ReportLayout.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.ReportLayout.onDestroyed(() => {
  
});
