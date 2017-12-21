'use strict';

var Pkg = require('./');
var pkg = new Pkg(process.cwd());

pkg.union('keywords', 'foo');
pkg.union('keywords', 'bar');
pkg.union('keywords', 'baz');

console.log(pkg.data);
