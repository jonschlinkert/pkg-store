/*!
 * pkg-store <https://github.com/jonschlinkert/pkg-store>
 *
 * Copyright (c) 2015-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const Cache = require('cache-base');
const write = require('write-json');

/**
 * Initialize a new `Pkg` store at the given `cwd` with
 * the specified `options`.
 *
 * ```js
 * const pkg = require('pkg-store')(process.cwd());
 * const pkg = new Pkg(cwd, options);
 * // or
 * const pkg = new Pkg(options);
 *
 * console.log(pkg.path);
 * //=> '~/your-project/package.json'
 *
 * console.log(pkg.data);
 * //=> { name: 'your-project', ... }
 * ```
 * @name Pkg
 * @param  {String} `cwd` Directory of the package.json to read.
 * @param  {Object} `options`
 * @api public
 */

class Pkg extends Cache {
  constructor(cwd, options) {
    super('data');

    if (typeof cwd !== 'string') {
      options = cwd;
      cwd = process.cwd();
    }

    this.options = Object.assign({cwd: cwd}, options);
    this.cwd = path.resolve(this.options.cwd);
    this.path = this.options.path || path.resolve(this.cwd, 'package.json');
    this.data = this.read();
  }

  /**
   * Write the `pkg.data` object to the file system at `pkg.path`.
   *
   * ```js
   * pkg.save();
   * ```
   * @name .save
   * @param {Function} `callback` (optional)
   * @api public
   */

  save(cb) {
    if (typeof cb !== 'function') {
      write.sync(this.path, this.data);
      return;
    }
    write(this.path, this.data, cb);
    return this;
  }

  /**
   * Reads `pkg.path` from the file system and returns an object.
   *
   * ```js
   * const data = pkg.read();
   * ```
   * @name .read
   * @return {undefined}
   * @api public
   */

  read() {
    if (fs.existsSync(this.path)) {
      try {
        return JSON.parse(fs.readFileSync(this.path, 'utf8'));
      } catch (err) {
        err.path = this.path;
        err.reason = 'Cannot read ' + this.path;
        throw err;
      }
    }
    return {};
  }
}

/**
 * Expoe `Pkg`
 */

module.exports = Pkg;
