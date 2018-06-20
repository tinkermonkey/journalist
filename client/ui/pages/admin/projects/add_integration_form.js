import './add_integration_form.html';
import { Template }           from 'meteor/templating';
import { Random }             from 'meteor/random';
import SimpleSchema           from 'simpl-schema';
import { Util }               from '../../../../../imports/api/util';
import { IntegrationServers } from '../../../../../imports/api/integrations/integration_servers';
import { ItemTypes }          from '../../../../../imports/api/imported_items/item_types';

let schema = new SimpleSchema({
  serverId: {
    type: String
  },
  itemType: {
    type: String
  }
});

/**
 * Template Helpers
 */
Template.AddIntegrationForm.helpers({
  getSchema () {
    return schema
  },
  serverOptions () {
    return IntegrationServers.find({}, { sort: { title: 1 } })
  },
  itemTypeOptions () {
    return _.keys(ItemTypes).map((key) => {
      return { _id: ItemTypes[ key ], title: Util.camelToTitle(key) }
    })
  }
});

/**
 * Template Event Handlers
 */
Template.AddIntegrationForm.events({
  'submit form' (e, instance) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

/**
 * Template Created
 */
Template.AddIntegrationForm.onCreated(() => {
  let instance = Template.instance();
  
  instance.formId = Random.id();
});

/**
 * Template Rendered
 */
Template.AddIntegrationForm.onRendered(() => {
  
});

/**
 * Template Destroyed
 */
Template.AddIntegrationForm.onDestroyed(() => {
  
});
