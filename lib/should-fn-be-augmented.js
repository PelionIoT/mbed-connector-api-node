var isFn = /^\s*function\s*\([^\)]*options\s*,\s*callback\s*\)/; // parse function header...
var stripSpaces = /\s+/g;

module.exports = function(fn) {
  if (typeof fn !== 'function') return false;
  
  var fnText = fn.toString().replace(stripSpaces, ' ');
  
  return isFn.test(fnText);
};
