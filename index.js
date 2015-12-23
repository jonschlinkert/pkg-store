/*!
 * pkg-store <https://github.com/jonschlinkert/pkg-store>
 *
 * Copyright (c) 2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var Store = require('data-store');

module.exports = function(cwd, prop) {
  return new Store('package', {cwd: cwd});
};
