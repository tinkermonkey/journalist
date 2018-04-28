import { Auth } from '../auth';
import 'meteor/cfs:collection';

export const StaticAssets = new FS.Collection("static_assets", {
  stores: [ new FS.Store.FileSystem("static_assets", { path: "/tmp" }) ]
});

StaticAssets.allow({
  'insert': Auth.denyIfNotAdmin,
  'update': Auth.denyIfNotAdmin,
  'remove': Auth.denyIfNotAdmin
});