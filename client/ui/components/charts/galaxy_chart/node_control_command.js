'use strict';

export class NodeControlCommand {
  /**
   * NodeControlCommand - a menu item with an icon to display to the user for controlling nodes
   * @param {String} iconUrl
   * @param {String} key
   * @param {String} title
   * @param {Function} commandFn A function to execute if the user selects this command. Will be passed the node and the underlying chart object
   */
  constructor (iconUrl, key, title, commandFn) {
    const self     = this;
    self.iconUrl   = iconUrl;
    self.key       = key;
    self.title     = title;
    self.commandFn = commandFn;
  }
}