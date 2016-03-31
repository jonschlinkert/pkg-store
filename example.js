'use strict';

var pkg = require('./')(process.cwd(), 'verb');

pkg.union('keywords', 'foo');
pkg.union('keywords', 'bar');
pkg.union('keywords', 'baz');

pkg.normalize();
console.log(pkg.data);
