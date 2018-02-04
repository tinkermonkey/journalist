let d3 = require('d3');

d3.selection.prototype.closest = function (selector) {
  let closestMatch = undefined;
  const matchArr   = [];
  this.each(function () {
    let elm = this;
    while (typeof elm.parentNode.matches === 'function' && !closestMatch) {
      elm = elm.parentNode;
      if (elm.matches(selector)) {
        closestMatch = elm;
        matchArr.push(closestMatch);
      }
    }
    closestMatch = undefined;
  });
  return d3.selectAll(matchArr);
};
