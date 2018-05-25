/**
 * Schema upgrade scripts that will fix data model changes
 */
import { Clustering }               from 'meteor/austinsand:journalist-clustering';
import { CapacityPlans }            from '../../api/capacity_plans/capacity_plans';
import { CapacityPlanOptions }      from '../../api/capacity_plans/capacity_plan_options';
import { CapacityPlanReleases }     from '../../api/capacity_plans/capacity_plan_releases';
import { Projects }                 from '../../api/projects/projects';
import { Releases }                 from '../../api/releases/releases';
import { CapacityPlanSprintBlocks } from '../../api/capacity_plans/capacity_plan_sprint_blocks';
import { CapacityPlanBlockTypes }   from '../../api/capacity_plans/capacity_plan_block_types';
import { ImportedItems }            from '../../api/imported_items/imported_items';
import { Integrations }             from '../../api/integrations/integrations';
import { Util }                     from '../../api/util';

// Only run on the cluster master node
if (Clustering.isMaster()) {
  console.log('==== Upgrade scripts executing');
  
  /**
   * Add date created to the links between items based on the item history
   */
  let undatedLinks = ImportedItems.find({ 'links.itemId': { $exists: true }, 'links.dateCreated': { $exists: false } });
  if (undatedLinks.count()) {
    console.log('==== Upgrade adding dateCreated to links without it:', undatedLinks.count());
    undatedLinks.forEach((item) => {
      // Look up the date the item was linked
      if (item.document.changelog && item.document.changelog.histories) {
        item.document.changelog.histories.forEach((entry) => {
          entry.items.forEach((changeItem) => {
            if (changeItem.field.toLowerCase() === 'link' && changeItem.to) {
              let dateCreated = moment(entry.created).toDate();
              // Update the link
              console.log('Setting link created date:', item.identifier, changeItem.to, dateCreated);
              ImportedItems.update({
                _id                   : item._id,
                'links.itemIdentifier': { $regex: changeItem.to, $options: 'i' }
              }, { $set: { 'links.$.dateCreated': dateCreated } })
            }
          })
        });
      }
    });
  }
  
  /**
   * Scrub duplicate links
   */
  // Scrub for duplicate links
  console.log('==== Upgrade checking for duplicate links:');
  ImportedItems.find({ links: { $exists: true } }).forEach((importedItem) => {
    if (importedItem.links && importedItem.links.length) {
      let linkCounts = {};
      importedItem.links.forEach((link) => {
        if (linkCounts[ link.linkId ] && linkCounts[ link.linkId ].count > 0) {
          linkCounts[ link.linkId ].count += 1;
        } else {
          linkCounts[ link.linkId ] = {
            link : link,
            count: 1
          };
        }
      });
      
      _.keys(linkCounts).forEach((linkId) => {
        let linkCount = linkCounts[ linkId ];
        if (linkCount.count > 1) {
          console.log('Removing duplicate links:', importedItem._id, importedItem.identifier, '->', linkCount.link.itemIdentifier);
          // Remove duplicated
          ImportedItems.update(importedItem._id, {
            $pull: {
              links: {
                linkId: linkCount.linkId
              }
            }
          });
          
          // Insert the link
          ImportedItems.update(importedItem._id, {
            $push: {
              links: linkCount.link
            }
          });
        }
      });
    }
  });
  
  console.log('==== Upgrade scripts complete');
}
