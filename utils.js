'use strict';

/**
 * Module dependencies
 */

var utils = require('lazy-cache')(require);
var fn = require;
require = utils;

/**
 * Lazily required module dependencies
 */

require('kind-of', 'typeOf');
require('union-value', 'union');
require('write-json', 'writeJson');
require = fn;

utils.isObject = function(val) {
  return utils.typeOf(val) === 'object';
};

/**
 * Expose `utils` modules
 */

module.exports = utils;
